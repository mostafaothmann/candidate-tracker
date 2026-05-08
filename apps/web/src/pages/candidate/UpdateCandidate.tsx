import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useNavigate, useParams } from "react-router-dom";
import { getCandidateDetail, updateCandidate } from "../../axios/candidate";
import { useState } from "react";
import type { ResponseCandidateDTO, UpdateCandidateDTO } from "../../../../../packages/shared/src/candidate/candidate.dto";
import { UpdateCandidateSchema } from "../../../../../packages/shared/src/candidate/candidate.schema";
import { handleErrorNotification, handleSuccessNotification } from "../../helpers/setErrorHandler";
import type { AxiosError } from "axios";

/**
 * UpdateCandidate Page
 *
 * Allows editing of an existing candidate.
 *
 * Features:
 * - Fetch candidate by ID
 * - Editable form fields (name, email, phone, etc.)
 * - Validation using Zod schema before update
 * - Prevents update if no changes detected
 * - Shows success/error notifications
 * - Navigates back after update or cancel
 */
export function UpdateCandidate() {
    // React Query client for cache invalidation
    const queryClient = useQueryClient();

    // Route params (candidate ID)
    const { id } = useParams();

    // Local form state (controlled form)
    const [form, setForm] = useState<ResponseCandidateDTO | null>(null);

    const navigate = useNavigate();

    // Fetch candidate details
    const { data: candidateProperities, isLoading } = useQuery({
        queryKey: ["candidate", id],
        queryFn: async () => {
            const res = await getCandidateDetail(id || "");

            // Initialize form once data is loaded
            setForm(res);

            return res;
        }
    });

    // Detect if form has been modified
    const isFormChanged =
        JSON.stringify(form) !== JSON.stringify(candidateProperities);

    // Update candidate mutation
    const updateCandidateLocal = useMutation({
        mutationFn: (data: UpdateCandidateDTO) =>
            updateCandidate(id ?? "", data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["candidate"] });

            handleSuccessNotification(
                "Success",
                "Candidate successfully updated"
            );
        },

        onError: (error: AxiosError<{ message: string }>) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;

            if (status === 400) {
                handleErrorNotification(
                    "Submission Failed",
                    message || "Invalid candidate data. Please check the form"
                );
            } else if (status === 409) {
                handleErrorNotification(
                    "Submission Failed",
                    message || "Email already exists"
                );
            } else {
                handleErrorNotification(
                    "Submission Failed",
                    message || "Please try again"
                );
            }
        },
    });

    /**
     * Handle update submission
     * - Validates form using Zod schema
     * - Sends mutation if valid
     */
    async function handleUpdate() {
        const result = UpdateCandidateSchema.safeParse(form);

        if (!result.success) {
            const errorMessage = result.error.issues[0].message;

            handleErrorNotification("Validation Error", errorMessage);

            return;
        }

        updateCandidateLocal.mutate(result.data);
    }

    /**
     * Handle input changes
     */
    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;

        setForm((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                [name]: value,
            };
        });
    }

    // Initial form setup when data arrives
    if (candidateProperities && !form) {
        setForm(candidateProperities);
    }

    // Loading state
    if (isLoading || !form) {
        return <div>Loading...</div>;
    }

    return (
        <div className="grid grid-cols-12 gap-2">

            {/* Name */}
            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>name :</h3>
                <Input
                    name="name"
                    className="w-full"
                    value={form?.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                />
            </div>

            {/* Email */}
            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>email :</h3>
                <Input
                    name="email"
                    className="w-full"
                    value={form?.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                />
            </div>

            {/* Phone */}
            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>phone :</h3>
                <Input
                    name="phone"
                    className="w-full"
                    value={form?.phone}
                    onChange={handleChange}
                    placeholder="031567123321"
                />
            </div>

            {/* Location */}
            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>location :</h3>
                <Input
                    name="location"
                    className="w-full"
                    value={form?.location}
                    onChange={handleChange}
                    placeholder="Berlin, Germany"
                />
            </div>

            {/* LinkedIn */}
            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>linkedIn :</h3>
                <Input
                    name="linkedin_url"
                    className="w-full"
                    value={form?.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/johndoe"
                />
            </div>

            {/* Notes */}
            <div className="col-span-12">
                <h3>notes :</h3>
                <TextArea
                    name="notes"
                    value={form?.notes}
                    style={{ maxWidth: "100%" }}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Experienced frontend developer with React and TypeScript"
                />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                    <Button onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </div>

                <div className="col-span-6">
                    <Button
                        onClick={() => handleUpdate()}
                        disabled={!isFormChanged}
                    >
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
}