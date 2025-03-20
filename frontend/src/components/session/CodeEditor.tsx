import React from 'react';
import Editor from '@monaco-editor/react';
import { Box, useTheme } from '@mui/material';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
    height?: string | number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    onChange,
    language,
    height = 300
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ 
            border: 1, 
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden'
        }}>
            <Editor
                height={height}
                language={language}
                value={value}
                onChange={(value) => onChange(value || '')}
                theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    automaticLayout: true
                }}
            />
        </Box>
    );
};