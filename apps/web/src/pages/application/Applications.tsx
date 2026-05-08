import {
    Button,
    DatePicker,
    Input,
    Modal,
    Pagination,
    Select,
    Skeleton,
    Space,
    Table,
} from "antd";
import type { ColumnType } from "antd/es/table";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApplications } from "../../axios/application";
import { deleteApplication } from "../../axios/application";
import {
    ApplicationStatusEnum,
    type ApplicationStatus,
} from "../../../../../packages/shared/src/application/application.schema";
import { Link, useNavigate } from "react-router-dom";
import type { ResponseApplicationDTO } from "../../../../../packages/shared/src/application/application.dto";
import { Dayjs } from "dayjs";
import {
    handleErrorNotification,
    handleSuccessNotification,
} from "../../helpers/setErrorHandler";
import { KanbanView } from "../../components/KanbanView";
import ButtonGroup from "antd/es/button/ButtonGroup";
import type { AxiosError } from "axios";

/**
 * Applications Page
 *
 * This page is responsible for:
 * - Listing all applications (table + kanban view)
 * - Searching applications with debounce
 * - Filtering by status and applied date range
 * - Pagination handling
 * - Deleting applications
 * - Switching between table and kanban views
 */
export default function Applications() {
    /**
     * View mode state:
     * - table: displays Ant Design table
     * - kanban: grouped pipeline view
     */
    const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

    /**
     * Static status options used in filters and forms
     */
    const ApplicationStatusOptions = [
        { label: "applied", value: "applied" },
        { label: "screening", value: "screening" },
        { label: "interview", value: "interview" },
        { label: "offer", value: "offer" },
        { label: "hired", value: "hired" },
        { label: "rejected", value: "rejected" },
    ];

    const queryClient = useQueryClient();

    const { RangePicker } = DatePicker;

    /**
     * Search & filter states
     */
    const [inputSearch, setInputSearch] = useState("");
    const [filterAppliedFrom, setFilterAppliedFrom] =
        useState<Dayjs | undefined>(undefined);
    const [filterAppliedTo, setFilterAppliedTo] =
        useState<Dayjs | undefined>(undefined);
    const [filterStatus, setFilterStatus] =
        useState<ApplicationStatus | undefined>(undefined);
    const [search, setSearch] = useState("");

    /**
     * Debounce handling for search input
     */
    const debounceRef = useRef<number | null>(null);

    const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputSearch(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = window.setTimeout(() => {
            setSearch(value);
        }, 300);
    };

    /**
     * Application form state (used in modals)
     */
    const [form, setForm] = useState({
        candidate_id: "",
        job_title: "",
        company: "",
        status: ApplicationStatusEnum.applied,
        applied_at: null as Dayjs | null,
        salary_expectation: 0,
        source: "",
        notes: "",
    });

    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [openAddingApplicationModal, setOpenAddingApplicationModal] =
        useState(false);
    const [openFilterModal, setOpenFilterModal] = useState(false);

    /**
     * Delete modal state
     */
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [delitedId, setdelitedId] = useState("");

    /**
     * Pagination state
     */
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(10);

    /**
     * Generic form input handler
     */
    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;

        setForm((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };
            return updated;
        });
    }

    /**
     * Fetch applications list with filters
     */
    const {
        data: applicationsData,
        refetch: refetchApplicationsData,
        isLoading,
    } = useQuery({
        queryKey: [
            "applications",
            page,
            search,
            filterStatus,
            filterAppliedFrom,
            filterAppliedTo,
        ],
        queryFn: async () => {
            const res = await getApplications(
                page,
                search,
                filterStatus,
                filterAppliedFrom?.startOf("day").toDate(),
                filterAppliedTo?.endOf("day").toDate()
            );

            setTotal(res.meta.total);
            return res.data;
        },
    });

    /**
     * Kanban grouping logic
     * Groups applications by status
     */
    const empty: Record<ApplicationStatus, ResponseApplicationDTO[]> = {
        applied: [],
        screening: [],
        interview: [],
        offer: [],
        hired: [],
        rejected: [],
    };

    const grouped = (applicationsData ?? []).reduce(
        (
            acc: Record<ApplicationStatus, ResponseApplicationDTO[]>,
            item: ResponseApplicationDTO
        ) => {
            const key = item.status as ApplicationStatus;
            acc[key].push(item);
            return acc;
        },
        empty
    );

    /**
     * Delete application mutation
     */
    const deleteApplicationMutation = useMutation({
        mutationFn: (delitedId: string) => deleteApplication(delitedId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
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

    /**
     * Handle delete action
     */
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

    /**
     * Open delete confirmation modal
     */
    const OpenDeleteModal = (id: string) => {
        setdelitedId(id);
        setOpenDeleteModal(true);
    };

    /**
     * Navigate to detail page
     */
    const navigate = useNavigate();

    const openShowModal = (id: string) => {
        navigate(`/application/detail/${id}`);
    };

    /**
     * Reset all filters and form states
     */
    const emptyFields = () => {
        setForm({
            candidate_id: "",
            job_title: "",
            company: "",
            status: ApplicationStatusEnum.applied,
            applied_at: null,
            salary_expectation: 0,
            source: "",
            notes: "",
        });

        setOpenAddingApplicationModal(false);
        setOpenFilterModal(false);
        setOpenDeleteModal(false);
        setFilterStatus(undefined);
        setFilterAppliedFrom(undefined);
        setFilterAppliedTo(undefined);
        setOpen(false);
    };

    /**
     * Table column definitions
     */
    const columns: ColumnType<ResponseApplicationDTO>[] = [
        {
            title: "Candidate",
            dataIndex: "candidate_name",
            sorter: (a, b) =>
                (a.candidate_name ?? "").localeCompare(
                    b.candidate_name ?? ""
                ),
            render: (value: string, record: ResponseApplicationDTO) => (
                <Link to={`/candidate/detail/${record.candidate_id}`}>
                    {value}
                </Link>
            ),
        },
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
                (a.salary_expectation ?? 0) -
                (b.salary_expectation ?? 0),
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
        <div>
            {/* Filters Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-lg font-semibold text-[#592C46]">
                        <span>Filters</span>
                    </div>
                }
                open={openFilterModal}
                onOk={() => setOpenFilterModal(false)}
                okButtonProps={{ variant: "outlined", color: "purple" }}
                onCancel={() => emptyFields()}
                mask={false}
            >
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12">
                        <h3>applying date :</h3>
                        <RangePicker
                            className="w-full"
                            value={[
                                filterAppliedFrom ?? null,
                                filterAppliedTo ?? null,
                            ]}
                            onChange={(values) => {
                                setFilterAppliedFrom(values?.[0] ?? undefined);
                                setFilterAppliedTo(values?.[1] ?? undefined);
                            }}
                        />
                    </div>

                    <div className="col-span-6 xl:col-span-3">
                        <h3>status :</h3>
                        <Select
                            placeholder="applied"
                            style={{ width: 200 }}
                            value={filterStatus}
                            onChange={(value) => setFilterStatus(value)}
                            options={ApplicationStatusOptions}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
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

            {/* Top Controls */}
            <div className="grid grid-cols-12 gap-4 md:gap-6 w-full">
                <Button
                    disabled
                    className="col-span-4 sm:col-span-3"
                    variant="solid"
                    color="cyan"
                    onClick={() => setOpen(true)}
                >
                    Add Application
                </Button>

                <div className="col-span-6 sm:col-span-7">
                    <Input
                        className="w-full"
                        value={inputSearch}
                        onChange={handleChangeSearch}
                        placeholder="Search applications..."
                    />
                </div>

                <Button
                    className="col-span-2 sm:col-span-2"
                    variant="solid"
                    color="cyan"
                    onClick={() => setOpenFilterModal(true)}
                    style={{
                        width: 48,
                        height: 32,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* filter icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                        <path d="M6 4v4" />
                        <path d="M6 12v8" />
                        <path d="M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                        <path d="M12 4v10" />
                        <path d="M12 18v2" />
                        <path d="M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                        <path d="M18 4v1" />
                        <path d="M18 9v11" />
                    </svg>
                </Button>

                <div className="col-span-12 sm:col-span-6 pt-3 pb-3">
                    <Pagination
                        showSizeChanger
                        current={page}
                        pageSize={limit}
                        total={total}
                        onChange={(page, pageSize) => {
                            setPage(page);
                            setLimit(pageSize);
                        }}
                    />
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="col-span-12 sm:col-span-6 pt-4 pb-4">
                <ButtonGroup>
                    <Button
                        style={{
                            backgroundColor:
                                viewMode === "table" ? "#06b6d4" : undefined,
                            color: viewMode === "table" ? "#fff" : undefined,
                        }}
                        onClick={() => setViewMode("table")}
                    >
                        Table
                    </Button>

                    <Button
                        style={{
                            backgroundColor:
                                viewMode === "kanban" ? "#84cc16" : undefined,
                            color: viewMode === "kanban" ? "#fff" : undefined,
                        }}
                        onClick={() => setViewMode("kanban")}
                    >
                        Kanban
                    </Button>
                </ButtonGroup>
            </div>

            {/* Main Content */}
            {isLoading ? (
                <Skeleton />
            ) : viewMode === "table" ? (
                <Table
                    scroll={{ x: "max-content" }}
                    columns={columns}
                    style={{ maxWidth: 1100 }}
                    pagination={false}
                    dataSource={applicationsData || []}
                />
            ) : (
                <KanbanView data={grouped || []} />
            )}
        </div>
    );
}