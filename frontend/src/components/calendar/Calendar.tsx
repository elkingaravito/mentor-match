import React, { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
} from "@mui/material";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCalendar } from "../../hooks/useCalendar";
import { AvailabilitySlot } from "../../types/matching";

const locales = {
    "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface NewSlotDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (slot: Omit<AvailabilitySlot, "id">) => void;
}

const NewSlotDialog: React.FC<NewSlotDialogProps> = ({ open, onClose, onSubmit }) => {
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [recurrence, setRecurrence] = useState<string>("");

    const handleSubmit = () => {
        onSubmit({
            start_time: startTime,
            end_time: endTime,
            recurrence: recurrence || undefined,
            is_available: true,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add Availability Slot</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                    <TextField
                        label="Start Time"
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="End Time"
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl>
                        <InputLabel>Recurrence</InputLabel>
                        <Select
                            value={recurrence}
                            onChange={(e) => setRecurrence(e.target.value)}
                            label="Recurrence"
                        >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="FREQ=WEEKLY">Weekly</MenuItem>
                            <MenuItem value="FREQ=BIWEEKLY">Bi-weekly</MenuItem>
                            <MenuItem value="FREQ=MONTHLY">Monthly</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Add Slot
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const Calendar: React.FC = () => {
    const {
        availability,
        loading,
        error,
        loadAvailability,
        createAvailability,
        deleteAvailability,
        syncCalendar,
    } = useCalendar();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewRange, setViewRange] = useState({
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    useEffect(() => {
        loadAvailability(viewRange.start, viewRange.end);
    }, [loadAvailability, viewRange]);

    const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
        if (Array.isArray(range)) {
            setViewRange({
                start: range[0],
                end: range[range.length - 1],
            });
        } else {
            setViewRange(range);
        }
    };

    const events = availability.map((slot) => ({
        id: slot.id,
        title: "Available",
        start: new Date(slot.start_time),
        end: new Date(slot.end_time),
        resource: slot,
    }));

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Availability Calendar</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        onClick={() => syncCalendar()}
                        sx={{ mr: 1 }}
                    >
                        Sync Calendar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        Add Availability
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                onRangeChange={handleRangeChange}
                selectable
                onSelectSlot={(slotInfo) => {
                    setIsDialogOpen(true);
                }}
                onSelectEvent={(event) => {
                    if (window.confirm("Delete this availability slot?")) {
                        deleteAvailability(event.id);
                    }
                }}
            />

            <NewSlotDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={createAvailability}
            />
        </Paper>
    );
};
