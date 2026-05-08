import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    DatePicker,
    Input,
    InputNumber,
    Select,
    Skeleton,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import {
    getApplicationDetail,
    updateApplication,
} from "../../axios/application";

import type {
    CreateApplicationDTO,
    ResponseApplicationDTO,
} from "../../../../../packages/shared/src/application/application.dto";

import { UpdateApplicationSchema } from "../../../../../packages/shared/src/application/application.schema";
import {
    handleErrorNotification,
    handleSuccessNotification,
} from "../../helpers/setErrorHandler";
import type { AxiosError } from "axios";

/**
 * UpdateApplication Page
 *
 * This page is responsible for:
 * - Fetching a single application by ID
 * - Hydrating form state with fetched data
 * - Allowing user to edit application fields
 * - Validating data using Zod schema
 * - Submitting updates via API mutation
 * - Preventing update when no changes are made
 */
export function UpdateApplication() {
    /**
     * React Query client (used for cache invalidation)
     */
    const queryClient = useQueryClient();

    const navigate = useNavigate();
    const { id } = useParams();

    /**
     * Status dropdown options for application
     */
    const ApplicationStatusOptions = [
        { label: "applied", value: "applied" },
        { label: "screening", value: "screening" },
        { label: "interview", value: "interview" },
        { label: "offer", value: "offer" },
        { label: "hired", value: "hired" },
        { label: "rejected", value: "rejected" },
    ];

    /**
     * Fetch application detail by ID
     */
    const { data: applicationProperities, isLoading } = useQuery({
        queryKey: ["application", id],
        queryFn: async () => {
            const res = await getApplicationDetail(id || "");
            setForm(res);
            return res;
        },
    });

    /**
     * Local form state (editable version of fetched data)
     */
    const [form, setForm] = useState<ResponseApplicationDTO | null>(null);

    /**
     * Check if form has changes compared to original data
     * Used to disable update button when nothing changed
     */
    const isFormChanged =
        JSON.stringify(form) !== JSON.stringify(applicationProperities);

    /**
     * Update mutation (API call)
     */
    const updateApplicationLocal = useMutation({
        mutationFn: (data: CreateApplicationDTO) =>
            updateApplication(id ?? "", data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["application"],
            });

            handleSuccessNotification(
                "Success",
                "Application successfully updated"
            );
        },

        onError: (error: AxiosError<{ message: string }>) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;

            if (status === 400) {
                handleErrorNotification(
                    "Submission Failed",
                    message ||
                    "Invalid application data. Please check the form"
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
     * Submit update handler
     * - Validates data using Zod schema
     * - Calls mutation if valid
     */
    async function handleUpdate() {
        const result = UpdateApplicationSchema.safeParse(form);

        if (!result.success) {
            const errorMessage = result.error.issues[0].message;

            handleErrorNotification("Validation Error", errorMessage);
            return;
        }

        updateApplicationLocal.mutate(result.data as CreateApplicationDTO);
    }

    /**
     * Initialize form once data is loaded
     * (syncs API response into local state)
     */
    if (applicationProperities && !form) {
        setForm(applicationProperities);
    }

    /**
     * Generic input handler for text fields
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

    /**
     * Loading state
     */
    if (isLoading || !form)
        return <Skeleton paragraph={{ rows: 6 }} />;

    return (
        <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>job :</h3>
                <Input
                    name="job_title"
                    className="w-full"
                    value={form.job_title}
                    onChange={handleChange}
                    placeholder="Full Stack Developer"
                />
            </div>

            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>expected salary :</h3>
                <InputNumber
                    className="w-full"
                    style={{ width: "100%" }}
                    value={form.salary_expectation}
                    onChange={(value) =>
                        setForm((prev) =>
                            prev
                                ? {
                                    ...prev,
                                    salary_expectation:
                                        value ?? 0,
                                }
                                : prev
                        )
                    }
                />
            </div>

            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>company :</h3>
                <Input
                    name="company"
                    className="w-full"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Henhouse Studio"
                />
            </div>

            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>applying date :</h3>
                <DatePicker
                    className="w-full"
                    value={
                        form.applied_at
                            ? dayjs(form.applied_at)
                            : null
                    }
                    onChange={(value) =>
                        setForm((prev) =>
                            prev
                                ? {
                                    ...prev,
                                    applied_at:
                                        value?.toDate() ??
                                        prev.applied_at,
                                }
                                : prev
                        )
                    }
                    placeholder="5/5/2026"
                />
            </div>

            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>source :</h3>
                <Input
                    name="source"
                    className="w-full"
                    value={form.source}
                    onChange={handleChange}
                    placeholder="LinkedIn"
                />
            </div>

            <div className="col-span-6 xl:col-span-3">
                <h3>status :</h3>
                <Select
                    style={{ width: "100%" }}
                    value={form.status}
                    onChange={(value) =>
                        setForm((prev) =>
                            prev ? { ...prev, status: value } : prev
                        )
                    }
                    options={ApplicationStatusOptions}
                />
            </div>

            <div className="col-span-12">
                <h3>notes :</h3>
                <TextArea
                    name="notes"
                    value={form.notes}
                    style={{ maxWidth: "100%" }}
                    onChange={handleChange}
                    rows={4}
                />
            </div>

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