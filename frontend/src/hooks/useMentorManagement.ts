import { useState, useCallback } from 'react';
import { 
    MentorProfile, 
    MentorFilter, 
    MentorSort, 
    MentorStatus,
    MentorListResponse 
} from '../types/mentor';

export const useMentorManagement = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [totalMentors, setTotalMentors] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchMentors = useCallback(async (
        filters: MentorFilter,
        sort: MentorSort,
        page: number,
        pageSize: number
    ) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/mentors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filters,
                    sort,
                    page,
                    pageSize,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch mentors');
            }

            const data: MentorListResponse = await response.json();
            setMentors(data.mentors);
            setTotalMentors(data.total);
            setPage(data.page);
            setPageSize(data.pageSize);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching mentors');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateMentorStatus = useCallback(async (
        mentorId: number,
        status: MentorStatus
    ) => {
        try {
            const response = await fetch(`/api/admin/mentors/${mentorId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error('Failed to update mentor status');
            }

            setMentors(prev => 
                prev.map(mentor => 
                    mentor.id === mentorId 
                        ? { ...mentor, status } 
                        : mentor
                )
            );
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error updating mentor status');
        }
    }, []);

    const deleteMentor = useCallback(async (mentorId: number) => {
        try {
            const response = await fetch(`/api/admin/mentors/${mentorId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete mentor');
            }

            setMentors(prev => prev.filter(mentor => mentor.id !== mentorId));
            setTotalMentors(prev => prev - 1);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error deleting mentor');
        }
    }, []);

    return {
        mentors,
        totalMentors,
        loading,
        error,
        page,
        pageSize,
        fetchMentors,
        updateMentorStatus,
        deleteMentor,
    };
};