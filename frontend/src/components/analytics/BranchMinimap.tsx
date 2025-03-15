import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import * as d3 from 'd3';

interface MinimapProps {
    commits: any[];
    viewportTransform: { x: number; y: number; k: number };
    containerDimensions: { width: number; height: number };
    onViewportChange: (transform: { x: number; y: number; k: number }) => void;
}

export const BranchMinimap: React.FC<MinimapProps> = ({
    commits,
    viewportTransform,
    containerDimensions,
    onViewportChange
}) => {
    const minimapRef = useRef<SVGSVGElement>(null);
    const theme = useTheme();
    const minimapHeight = 100;
    const minimapWidth = 200;
    const padding = 10;

    useEffect(() => {
        if (!minimapRef.current || !commits.length) return;

        // Clear previous content
        d3.select(minimapRef.current).selectAll('*').remove();

        const svg = d3.select(minimapRef.current);
        
        // Calculate scales
        const timeExtent = d3.extent(commits, d => d.timestamp) as [number, number];
        const xScale = d3.scaleLinear()
            .domain(timeExtent)
            .range([padding, minimapWidth - padding]);

        const branchNames = Array.from(new Set(commits.map(c => c.branch)));
        const yScale = d3.scalePoint()
            .domain(branchNames)
            .range([padding, minimapHeight - padding]);

        // Draw branch lines
        branchNames.forEach(branch => {
            const branchCommits = commits.filter(c => c.branch === branch);
            if (branchCommits.length > 1) {
                svg.append('path')
                    .datum(branchCommits)
                    .attr('d', d3.line()
                        .x(d => xScale(d.timestamp))
                        .y(() => yScale(branch) || 0)
                    )
                    .attr('stroke', theme.palette.divider)
                    .attr('stroke-width', 1)
                    .attr('fill', 'none');
            }
        });

        // Draw commit points
        svg.selectAll('.minimap-commit')
            .data(commits)
            .enter()
            .append('circle')
            .attr('class', 'minimap-commit')
            .attr('cx', d => xScale(d.timestamp))
            .attr('cy', d => yScale(d.branch) || 0)
            .attr('r', 2)
            .attr('fill', theme.palette.primary.main);

        // Draw viewport rectangle
        const viewportRect = svg.append('rect')
            .attr('class', 'viewport')
            .attr('stroke', theme.palette.primary.main)
            .attr('stroke-width', 1)
            .attr('fill', theme.palette.primary.main)
            .attr('fill-opacity', 0.1)
            .style('pointer-events', 'none');

        // Update viewport rectangle
        function updateViewport() {
            const { x, y, k } = viewportTransform;
            const viewportWidth = (containerDimensions.width / k) * (minimapWidth / containerDimensions.width);
            const viewportHeight = (containerDimensions.height / k) * (minimapHeight / containerDimensions.height);
            
            viewportRect
                .attr('x', -x * (minimapWidth / containerDimensions.width))
                .attr('y', -y * (minimapHeight / containerDimensions.height))
                .attr('width', viewportWidth)
                .attr('height', viewportHeight);
        }

        updateViewport();

        // Add drag behavior
        const drag = d3.drag()
            .on('drag', (event) => {
                const newX = -event.x * (containerDimensions.width / minimapWidth);
                const newY = -event.y * (containerDimensions.height / minimapHeight);
                onViewportChange({ ...viewportTransform, x: newX, y: newY });
            });

        svg.call(drag as any);

    }, [commits, viewportTransform, containerDimensions, theme]);

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                width: minimapWidth,
                height: minimapHeight,
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 2,
                p: 1
            }}
        >
            <svg
                ref={minimapRef}
                width={minimapWidth}
                height={minimapHeight}
                style={{ cursor: 'pointer' }}
            />
        </Box>
    );
};