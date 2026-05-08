import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { Button, DatePicker, Input, InputNumber, Select, Skeleton } from "antd";
import TextArea from "antd/es/input/TextArea";

import dayjs from "dayjs";

import { getApplicationDetail } from "../../axios/application";

import type { ResponseApplicationDTO } from "../../../../../packages/shared/src/application/application.dto";

/**
 * Application Detail Page
 *
 * Displays full details of a single application.
 *
 * Features:
 * - Fetch application by ID
 * - Display read-only application fields
 * - Navigate back or to update page
 * - Handles date formatting with dayjs
 */
export function Application() {
    const navigate = useNavigate();
    const { id } = useParams();

    const ApplicationStatusOptions = [
        { label: "applied", value: "applied" },
        { label: "screening", value: "screening" },
        { label: "interview", value: "interview" },
        { label: "offer", value: "offer" },
        { label: "hired", value: "hired" },
        { label: "rejected", value: "rejected" },
    ];

    const { data: applicationProperities, isLoading } = useQuery({
        queryKey: ["application", id],
        queryFn: async () => {
            const res = await getApplicationDetail(id || "");
            return res;
        },
    });

    const [form, setForm] = useState<ResponseApplicationDTO | null>(null);

    if (applicationProperities && !form) {
        setForm(applicationProperities);
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;

        setForm((prev) => {
            if (!prev) return prev;
            return { ...prev, [name]: value };
        });
    }

    if (isLoading || !form) {
        return <Skeleton paragraph={{ rows: 6 }} />;
    }

    return (
        <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 sm:col-span-6">
                <h3>job :</h3>
                <Input
                    disabled
                    name="job_title"
                    className="w-full"
                    value={form.job_title}
                    onChange={handleChange}
                    placeholder="Full Stack Developer"
                />
            </div>

            <div className="col-span-12 sm:col-span-6">
                <h3>expected salary :</h3>
                <InputNumber
                    disabled
                    className="w-full"
                    style={{ width: "100%" }}
                    value={form.salary_expectation}
                    onChange={(value) =>
                        setForm((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      salary_expectation: value ?? 0,
                                  }
                                : prev
                        )
                    }
                />
            </div>

            <div className="col-span-12 sm:col-span-6">
                <h3>company :</h3>
                <Input
                    disabled
                    name="company"
                    className="w-full"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Henhouse Studio"
                />
            </div>

            <div className="col-span-12 sm:col-span-6">
                <h3>applying date :</h3>
                <DatePicker
                    disabled
                    className="w-full"
                    value={form.applied_at ? dayjs(form.applied_at) : null}
                    onChange={(value) =>
                        setForm((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      applied_at:
                                          value?.toDate() ?? prev.applied_at,
                                  }
                                : prev
                        )
                    }
                    placeholder="5/5/2026"
                />
            </div>

            <div className="col-span-12 sm:col-span-6">
                <h3>source :</h3>
                <Input
                    disabled
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
                    disabled
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
                    disabled
                    name="notes"
                    value={form.notes}
                    style={{ maxWidth: "100%" }}
                    onChange={handleChange}
                    rows={4}
                />
            </div>

            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                    <Button onClick={() => navigate(-1)}>Back</Button>
                </div>

                <div className="col-span-6">
                    <Button
                        onClick={() =>
                            navigate(`/application/update/${form?.id}`)
                        }
                    >
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
}