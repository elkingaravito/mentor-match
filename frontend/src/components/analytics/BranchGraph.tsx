import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import * as d3 from 'd3';

interface CommitNode {
    id: string;
    message: string;
    timestamp: number;
    branch: string;
    tags: string[];
    parentIds: string[];
}

interface BranchGraphProps {
    commits: CommitNode[];
    selectedCommit?: string;
    onCommitSelect: (commitId: string) => void;
}

export const BranchGraph: React.FC<BranchGraphProps> = ({
    commits,
    selectedCommit,
    onCommitSelect
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const theme = useTheme();

    const containerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
    const [hoveredCommit, setHoveredCommit] = useState<string | null>(null);
    const [filteredCommits, setFilteredCommits] = useState<string[]>([]);

    const handleSearch = (query: string) => {
        if (!query) {
            setFilteredCommits([]);
            return;
        }
        const searchLower = query.toLowerCase();
        const matchingCommits = commits.filter(commit => 
            commit.message.toLowerCase().includes(searchLower) ||
            commit.id.includes(searchLower) ||
            commit.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
        setFilteredCommits(matchingCommits.map(c => c.id));
    };

    const handleFilter = (filters: SearchFilters) => {
        if (!Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f)) {
            setFilteredCommits([]);
            return;
        }
        const matchingCommits = commits.filter(commit => 
            (!filters.branches.length || filters.branches.includes(commit.branch)) &&
            (!filters.tags.length || commit.tags.some(tag => filters.tags.includes(tag))) &&
            (!filters.authors.length || filters.authors.includes(commit.author))
        );
        setFilteredCommits(matchingCommits.map(c => c.id));
    };

    useEffect(() => {
        if (!svgRef.current || !commits.length) return;

        // Update node opacity based on filtered commits
        if (filteredCommits.length > 0) {
            d3.select(svgRef.current)
                .selectAll('.commit-node')
                .style('opacity', d => filteredCommits.includes(d.id) ? 1 : 0.3);
        } else {
            d3.select(svgRef.current)
                .selectAll('.commit-node')
                .style('opacity', 1);
        }

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;
        const nodeRadius = 6;
        const nodePadding = 40;
        const branchPadding = 30;

        // Create zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 4])
            .on('zoom', (event) => {
                const { x, y, k } = event.transform;
                setTransform({ x, y, k });
                svg.attr('transform', `translate(${x}, ${y}) scale(${k})`);
            });

        // Apply zoom behavior
        d3.select(svgRef.current)
            .call(zoom as any)
            .on('dblclick.zoom', null);

        // Clear previous content
        d3.select(svgRef.current).selectAll('*').remove();

        // Create SVG
        const svg = d3.select(svgRef.current)
            .append('g')
            .attr('transform', `translate(${nodeRadius * 2}, ${height / 2})`);

        // Process commits to create graph structure
        const processedCommits = processCommits(commits);
        const branches = Array.from(new Set(commits.map(c => c.branch)));

        // Create scales
        const timeScale = d3.scaleLinear()
            .domain([
                d3.min(commits, d => d.timestamp) || 0,
                d3.max(commits, d => d.timestamp) || 0
            ])
            .range([0, width - nodeRadius * 4]);

        const branchScale = d3.scalePoint()
            .domain(branches)
            .range([-height/2 + branchPadding, height/2 - branchPadding]);

        // Draw branch lines
        branches.forEach(branch => {
            const branchCommits = processedCommits.filter(c => c.branch === branch);
            if (branchCommits.length > 1) {
                svg.append('path')
                    .datum(branchCommits)
                    .attr('class', 'branch-line')
                    .attr('d', d3.line<CommitNode>()
                        .x(d => timeScale(d.timestamp))
                        .y(() => branchScale(branch) || 0)
                    )
                    .attr('stroke', theme.palette.divider)
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
            }
        });

        // Draw merge lines
        processedCommits.forEach(commit => {
            commit.parentIds.forEach(parentId => {
                const parent = processedCommits.find(c => c.id === parentId);
                if (parent && parent.branch !== commit.branch) {
                    svg.append('path')
                        .attr('class', 'merge-line')
                        .attr('d', d3.line()([
                            [timeScale(commit.timestamp), branchScale(commit.branch) || 0],
                            [timeScale(parent.timestamp), branchScale(parent.branch) || 0]
                        ]))
                        .attr('stroke', theme.palette.primary.main)
                        .attr('stroke-width', 2)
                        .attr('stroke-dasharray', '4,4')
                        .attr('fill', 'none');
                }
            });
        });

        // Draw commit nodes with interactions
        const nodes = svg.selectAll('.commit-node')
            .data(processedCommits)
            .enter()
            .append('g')
            .attr('class', 'commit-node')
            .attr('transform', d => 
                `translate(${timeScale(d.timestamp)},${branchScale(d.branch) || 0})`
            )
            .on('mouseenter', (event, d) => {
                setHoveredCommit(d.id);
                setTooltip({
                    x: event.pageX,
                    y: event.pageY,
                    content: getCommitDetails(d)
                });
            })
            .on('mouseleave', () => {
                setHoveredCommit(null);
                setTooltip(null);
            })
            .on('contextmenu', (event, d) => {
                event.preventDefault();
                showContextMenu(event, d);
            });

        // Add hover effects
        nodes.append('circle')
            .attr('class', 'hover-circle')
            .attr('r', nodeRadius * 1.5)
            .attr('fill', theme.palette.action.hover)
            .attr('opacity', 0)
            .style('pointer-events', 'none');

        // Add selection highlight
        nodes.filter(d => d.id === selectedCommit)
            .append('circle')
            .attr('r', nodeRadius * 1.8)
            .attr('fill', 'none')
            .attr('stroke', theme.palette.primary.main)
            .attr('stroke-width', 2)
            .attr('opacity', 0.5);

        // Add commit circles
        nodes.append('circle')
            .attr('r', nodeRadius)
            .attr('fill', d => d.id === selectedCommit ? 
                theme.palette.primary.main : 
                theme.palette.background.paper
            )
            .attr('stroke', d => d.id === selectedCommit ?
                theme.palette.primary.main :
                theme.palette.text.primary
            )
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('click', (event, d) => onCommitSelect(d.id));

        // Add commit messages
        nodes.append('text')
            .attr('x', nodeRadius * 1.5)
            .attr('y', nodeRadius)
            .attr('fill', theme.palette.text.primary)
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .text(d => truncateMessage(d.message));

        // Add tags
        nodes.each(function(d) {
            if (d.tags.length) {
                const tag = d3.select(this)
                    .append('g')
                    .attr('transform', `translate(${nodeRadius * 1.5}, ${-nodeRadius * 2})`);

                tag.selectAll('.tag')
                    .data(d.tags)
                    .enter()
                    .append('text')
                    .attr('x', (_, i) => i * 60)
                    .attr('fill', theme.palette.secondary.main)
                    .style('font-size', '10px')
                    .text(t => t);
            }
        });

    }, [commits, selectedCommit, theme]);

    const processCommits = (commits: CommitNode[]): CommitNode[] => {
        // Sort commits by timestamp
        return [...commits].sort((a, b) => a.timestamp - b.timestamp);
    };

    const truncateMessage = (message: string): string => {
        return message.length > 30 ? message.substring(0, 27) + '...' : message;
    };

    return (
        <Box 
            ref={containerRef}
            sx={{ 
                width: '100%', 
                height: 400, 
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1,
                    p: 1
                }}
            >
                <IconButton
                    size="small"
                    onClick={() => {
                        const zoom = d3.zoom().transform as any;
                        d3.select(svgRef.current).call(
                            zoom,
                            d3.zoomIdentity.scale(1.2)
                        );
                    }}
                >
                    <ZoomInIcon />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => {
                        const zoom = d3.zoom().transform as any;
                        d3.select(svgRef.current).call(
                            zoom,
                            d3.zoomIdentity.scale(0.8)
                        );
                    }}
                >
                    <ZoomOutIcon />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => {
                        const zoom = d3.zoom().transform as any;
                        d3.select(svgRef.current).call(
                            zoom,
                            d3.zoomIdentity
                        );
                    }}
                >
                    <RestoreIcon />
                </IconButton>
            </Box>

            <svg
                ref={svgRef}
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'grab'
                }}
            />

            {tooltip && (
                <Box
                    sx={{
                        position: 'fixed',
                        left: tooltip.x + 10,
                        top: tooltip.y + 10,
                        bgcolor: 'background.paper',
                        boxShadow: 2,
                        borderRadius: 1,
                        p: 1,
                        zIndex: 1400,
                        maxWidth: 300
                    }}
                >
                    <Typography variant="body2">
                        {tooltip.content}
                    </Typography>
                </Box>
            )}

            <CommitContextMenu
                commit={contextMenuCommit}
                anchorPosition={contextMenuPosition}
                onClose={() => setContextMenuCommit(null)}
                onAction={handleContextMenuAction}
            />
        </Box>
    );
};
