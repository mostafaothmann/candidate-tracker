import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Modal, Space, Table, Skeleton } from "antd";
import type { ColumnType } from "antd/es/table";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ResponseApplicationDTO } from "../../../../packages/shared/src/application/application.dto";

import { deleteApplication } from "../axios/application";
import {
    handleErrorNotification,
    handleSuccessNotification,
} from "../helpers/setErrorHandler";
import type { AxiosError } from "axios";

type ApplicationsTableProps = {
    tableData: ResponseApplicationDTO[];
    isLoading: boolean;
};

/**
 * CandidateApplications Table Component
 *
 * Displays all applications related to a candidate in a tabular format.
 *
 * Features:
 * - Sortable columns (job, status, company, salary, date)
 * - Delete application with confirmation modal
 * - Navigate to application detail page
 * - Loading skeleton state
 */
export function CandidateApplications({
    tableData,
    isLoading,
}: ApplicationsTableProps) {
    const [loading, setLoading] = useState(false);

    const queryClient = useQueryClient();

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [delitedId, setdelitedId] = useState("");

    const navigate = useNavigate();

    const deleteApplicationMutation = useMutation({
        mutationFn: (delitedId: string) => deleteApplication(delitedId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["candidate"] });
            handleSuccessNotification(
                "Success",
                "Application deleted successfully"
            );
        },
        onError: (error: AxiosError<{ message: string }>) => {
            handleErrorNotification(
                "Delete Failed",
                error?.response?.data?.message || "Please try again"
            );
        },
    });

    const OpenDeleteModal = (id: string) => {
        setdelitedId(id);
        setOpenDeleteModal(true);
    };

    async function handleDelete(id: string) {
        setLoading(true);
        try {
            await deleteApplicationMutation.mutateAsync(id);
            setOpenDeleteModal(false);
        } finally {
            setLoading(false);
            setOpenDeleteModal(false);
        }
    }

    const openShowModal = (id: string) => {
        navigate(`/application/detail/${id}`);
    };

    const columns: ColumnType<ResponseApplicationDTO>[] = [
        {
            title: "JOB",
            dataIndex: "job_title",
            sorter: (a, b) =>
                (a.job_title ?? "").localeCompare(b.job_title ?? ""),
        },
        {
            title: "Status",
            dataIndex: "status",
            sorter: (a, b) =>
                (a.status ?? "").localeCompare(b.status ?? ""),
        },
        {
            title: "Company",
            dataIndex: "company",
            sorter: (a, b) =>
                (a.company ?? "").localeCompare(b.company ?? ""),
        },
        {
            title: "Expected Salary",
            dataIndex: "salary_expectation",
            sorter: (a, b) =>
                (a.salary_expectation ?? 0) - (b.salary_expectation ?? 0),
        },
        {
            title: "Date of Applying",
            dataIndex: "applied_at",
            sorter: (a, b) =>
                new Date(a.applied_at ?? 0).getTime() -
                new Date(b.applied_at ?? 0).getTime(),
            render: (value: string) => value?.slice(0, 10),
        },
        {
            title: "",
            render: (record: ResponseApplicationDTO) => (
                <Space size="middle">
                    <Button
                        variant="solid"
                        danger
                        onClick={() => OpenDeleteModal(record.id)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
        {
            title: "",
            fixed: "right",
            render: (record: ResponseApplicationDTO) => (
                <Space size="middle">
                    <Button
                        variant="solid"
                        color="cyan"
                        onClick={() => openShowModal(record.id)}
                    >
                        Show
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="w-full col-span-full rounded-2xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-white/[0.03] ">
            <Modal
                title="Confirm Delete"
                open={openDeleteModal}
                onOk={() => handleDelete(delitedId)}
                onCancel={() => setOpenDeleteModal(false)}
                confirmLoading={loading}
                mask={false}
                okType="danger"
                okButtonProps={{ type: "primary" }}
            >
                Are you Sure you want to delete this Application
            </Modal>

            {isLoading ? (
                <Skeleton className="h-full w-full" paragraph={{ rows: 10 }} />
            ) : (
                <Table
                    scroll={{ x: "max-content" }}
                    columns={columns}
                    style={{ maxWidth: 1100 }}
                    pagination={{
                        position: ["topRight"],
                    }}
                    dataSource={tableData || []}
                />
            )}
        </div>
    );
}