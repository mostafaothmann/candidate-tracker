

import { Button, DatePicker, Input, InputNumber, Modal, notification, Select, Skeleton, Space, Table } from "antd";
import TextArea from "antd/es/input/TextArea";
import type { ColumnType } from "antd/es/table";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCandidates } from "../../axios/candidate";
import { createCandidate, deleteCandidate } from "../../axios/candidate";
import { CreateCandidateSchema } from "../../../../../packages/shared/src/candidate/candidate.schema";
import { useNavigate } from "react-router-dom";
import type { ResponseCandidateDTO } from "../../../../../packages/shared/src/candidate/candidate.dto";
import { ApplicationStatusEnum, CreateApplicationSchema, type ApplicationStatus } from "../../../../../packages/shared/src/application/application.schema";
import type { Dayjs } from "dayjs";
import { createApplication } from "../../axios/application";
import { handleErrorNotification, handleSuccessNotification } from "../../helpers/setErrorHandler";
import type { AxiosError } from "axios";

/**
 * Applications Page
 *
 * This page is responsible for:
 * - Listing all candidates (table view)
 * - Searching candidates with debounce
 * - Pagination handling
 * - Deleting candidates
 * - Adding applications to candidates
 * - Navigating to any Candidate detail page 
 */

export default function Candidates() {
    //Query Client
    const queryClient = useQueryClient();
    //Search 
    const [inputSearch, setInputSearch] = useState("");
    const [search, setSearch] = useState("");

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
    //Application Status
    const ApplicationStatusOptions = [
        { label: 'applied', value: 'applied' },
        { label: 'screening', value: 'screening' },
        { label: 'interview', value: 'interview' },
        { label: 'offer', value: 'offer' },
        { label: 'hired', value: 'hired' },
        { label: 'rejected', value: 'rejected' }
    ]
    //Application Form
    const [applicationForm, setApplicationForm] = useState({
        candidate_id: "",
        job_title: "",
        company: "",
        status: ApplicationStatusEnum.applied,
        applied_at: null as Dayjs | null,
        salary_expectation: 0,
        source: "",
        notes: "",
    });
    //Candidate Form
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        linkedin_url: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false)
    const [openAddingApplicationModal, setOpenAddingApplicationModal] = useState(false)

    //Delete Modal 
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [delitedId, setdelitedId] = useState("");
    //table constants
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [total, setTotal] = useState(10)
    //handleChangeApplicationForm
    function handleChangeApplicationForm(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;
        setApplicationForm((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };
            return updated;
        });
    }
    //handleChange 
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

    //Getting Data 
    const { data: candidatesData, refetch: refetchCandidatesData, isLoading } = useQuery({
        queryKey: ["candidates", page, search],
        queryFn: async () => {
            const res = await getCandidates(page, search);
            setTotal(res.meta.total);
            return res.data
        }
    })

    //Delete Candidate
    const deleteCandidateMutation = useMutation({
        mutationFn: (delitedId: string) => deleteCandidate(delitedId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["candidates"] });
            handleSuccessNotification("Success", "Candidate deleted successfully")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            handleErrorNotification("Delete Failed", error?.response?.data?.message || "Please try again")
        },
    });
    //Delete 
    async function handleDelete(id: string) {
        setLoading(true);
        try {
            await deleteCandidateMutation.mutateAsync(id);
            setOpenDeleteModal(false);
        } finally {
            setLoading(false);
            setOpenDeleteModal(false)
        }
    }

    //Adding Candidate
    const addCandidate = useMutation({
        mutationFn: createCandidate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["candidates"] });
            handleSuccessNotification("Success", "Candidate successfully created")
        },
        onError:(error: AxiosError<{ message: string }>) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;

            if (status === 400) {
                handleErrorNotification("Submission Failed", message || "Invalid candidate data. Please check the form")
            } else if (status === 409) {
                handleErrorNotification("Submission Failed", message || "Email already exists")
            } else {
                handleErrorNotification("Submission Failed", message || "Please try again")
            }
        },
    });
    async function handleAdd() {
        const result = CreateCandidateSchema.safeParse(form);
        if (!result.success) {
            const errorMessage = result.error.issues[0].message;
            handleErrorNotification("Validation Error", errorMessage)
            return;
        }
        addCandidate.mutate(result.data);
        emptyFields();
    }
    //Handle Adding Application
    //adding application
    const addApplication = useMutation({
        mutationFn: createApplication,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            handleSuccessNotification("Success", "Application successfully created")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;
            if (status === 400) {
                handleErrorNotification("Submission Failed", message || "Invalid application data. Please check the form")
            } else if (status === 409) {
                handleErrorNotification("Submission Failed", message || "Email already exists")
            } else {
                handleErrorNotification("Submission Failed", message || "Please try again")
            }
        },
    });
    async function handleAddApplicationForm() {
        console.log('applying date at submit:', applicationForm.applied_at)
        const payload = {
            ...applicationForm,
            applied_at: applicationForm.applied_at?.toDate() ?? new Date(),
            status: applicationForm.status ?? ApplicationStatusEnum.applied,
        };
        const result = CreateApplicationSchema.safeParse(payload);
        if (!result.success) {
            const errorMessage = result.error.issues[0].message;
            handleErrorNotification("Validation Error", errorMessage)
            return;
        }
        addApplication.mutate(result.data);
        emptyFields();
    }

    //deleteModal
    const OpenDeleteModal = (id: string) => {
        setdelitedId(id);
        setOpenDeleteModal(true);
    }
    //showModal
    const navigate = useNavigate();
    const openShowModal = (id: string) => {
        navigate(`/candidate/detail/${id}`);
    }

    //emptyFields function
    const emptyFields = () => {
        setForm({
            name: "",
            email: "",
            phone: "",
            location: "",
            linkedin_url: "",
            notes: "",
        });
        setApplicationForm({
            candidate_id: "",
            job_title: "",
            company: "",
            status: ApplicationStatusEnum.applied,
            applied_at: null,
            salary_expectation: 0,
            source: "",
            notes: "",
        })
        setOpenAddingApplicationModal(false);
        setOpen(false);
    }
    //Columns
    const columns: ColumnType<ResponseCandidateDTO>[] = [
        {
            title: "Name",
            dataIndex: "name",
            sorter: (a: ResponseCandidateDTO, b: ResponseCandidateDTO) => (a.name ?? '').localeCompare(b.name ?? ''),
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: (a: ResponseCandidateDTO, b: ResponseCandidateDTO) => (a.email ?? '').localeCompare(b.email ?? ''),
        },
        {
            title: "Phone",
            dataIndex: "phone",
            sorter: (a: ResponseCandidateDTO, b: ResponseCandidateDTO) => (a.phone ?? '').localeCompare(b.phone ?? ''),
        },
        {
            title: "Location",
            dataIndex: "location",
            sorter: (a: ResponseCandidateDTO, b: ResponseCandidateDTO) => (a.location ?? '').localeCompare(b.location ?? ''),
        },
        {
            title: "Date of Creation",
            dataIndex: "created_at",
            sorter: (a: ResponseCandidateDTO, b: ResponseCandidateDTO) =>
                new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime(),
            render: (value: string) => value?.slice(0, 10)
        },
        {
            title: "",
            render: ( record: ResponseCandidateDTO) => (
                <Space size="middle">
                    <Button
                        variant="outlined"
                        color="cyan"
                        onClick={() => {
                            setApplicationForm(prev => ({ ...prev, candidate_id: record.id }))
                            console.log(record.id)
                            console.log(applicationForm)
                            setOpenAddingApplicationModal(true)
                        }}
                    >
                        Add Application
                    </Button>
                </Space>
            ),
        },
        {
            title: "",
            render: (record:ResponseCandidateDTO) => (
                <Space size="middle">
                    <Button
                        variant="solid"
                        danger
                        onClick={() => {
                            OpenDeleteModal(record.id)
                        }}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },

        {
            title: "",
            fixed: 'right',
            render: (record:ResponseCandidateDTO) => (
                <Space size="middle">
                    <Button
                        variant="solid"
                        color="cyan"
                        onClick={() => {
                            openShowModal(record.id)
                        }}
                    >
                        Show
                    </Button>
                </Space>
            ),
        }
    ];

    return <div>
        {/*Adding Application Modal*/}
        <Modal
            title={
                <div className="flex items-center gap-2 text-lg font-semibold text-[#592C46]">
                    <span>Adding Application</span>
                </div>
            }
            open={openAddingApplicationModal}
            onOk={() => handleAddApplicationForm()}
            okButtonProps={{ variant: "outlined", color: "purple" }}
            onCancel={() => emptyFields()}
            mask={false}
        >
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        job :
                    </h3>
                    <Input
                        name="job_title"
                        className="w-full"
                        value={applicationForm.job_title}
                        onChange={handleChangeApplicationForm}
                        placeholder="Full Stack Developer"
                    />
                </div>
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        expected salary :
                    </h3>
                    <InputNumber
                        className="w-full"
                        style={{ width: '100%' }}
                        value={applicationForm.salary_expectation}
                        onChange={(value) => setApplicationForm(prev => ({ ...prev, salary_expectation: value ?? 0 }))}
                        placeholder="Salary Expectation"
                    />
                </div>
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        company :
                    </h3>
                    <Input
                        name="company"
                        className="w-full"
                        value={applicationForm.company}
                        onChange={handleChangeApplicationForm}
                        placeholder="Henhouse Studio"
                    />
                </div>
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        applying date :
                    </h3>
                    <DatePicker
                        className="w-full"
                        value={applicationForm.applied_at}
                        onChange={(value) => setApplicationForm(prev => ({ ...prev, applied_at: value }))}
                        placeholder="5/5/2026" />
                </div>
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        source :
                    </h3>
                    <Input
                        name="source"
                        className="w-full"
                        value={applicationForm.source}
                        onChange={handleChangeApplicationForm}
                        placeholder="LinkedIn"
                    />
                </div>

                <div className="col-span-6 xl:col-span-3">
                    <div>
                        <h3>
                            status :
                        </h3>
                    </div>
                    <Select
                        placeholder="applied"
                        style={{ width: 200 }}
                        value={applicationForm.status}
                        onChange={(value) => {
                            setApplicationForm(prev => ({ ...prev, status: value }))
                        }}
                        options={ApplicationStatusOptions}
                    />
                </div>

                <div className="col-span-12">
                    <h3>
                        notes :
                    </h3>
                    <TextArea
                        name="notes"
                        value={applicationForm.notes}
                        style={{ maxWidth: '100%' }}
                        onChange={handleChangeApplicationForm}
                        rows={4}
                        placeholder="Experienced frontend developer with React and TypeScript"
                    />
                </div>
            </div>
        </Modal>

        {/*Filters Modal*/}
        <Modal
            title={
                <div className="flex items-center gap-2 text-lg font-semibold text-[#592C46]">
                    <span>Search</span>
                </div>
            }
            open={open}
            onOk={() => handleAdd()}
            okButtonProps={{ variant: "outlined", color: "purple" }}
            onCancel={() => emptyFields()}
            mask={false}
        >
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        name :
                    </h3>
                    <Input
                        name="name"
                        className="w-full"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                    />
                </div>
            </div>
        </Modal>
        {/*Adding Modal*/}
        <Modal
            title={
                <div className="flex items-center gap-2 text-lg font-semibold text-[#592C46]">
                    <span>Adding Candidate</span>
                </div>
            }
            open={open}
            onOk={() => handleAdd()}
            okButtonProps={{ variant: "outlined", color: "purple" }}
            onCancel={() => emptyFields()}
            mask={false}
        >
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        name :
                    </h3>
                    <Input
                        name="name"
                        className="w-full"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                    />
                </div>
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        email :
                    </h3>
                    <Input
                        name="email"
                        className="w-full"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john.doe@example.com"
                    />
                </div>
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        phone :
                    </h3>
                    <Input
                        name="phone"
                        className="w-full"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="031567123321"
                    />
                </div>
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        location :
                    </h3>
                    <Input
                        name="location"
                        className="w-full"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Berlin, Germany"
                    />
                </div>
                <div className="col-span-12 sm:col-span-6">
                    <h3>
                        linkedIn :
                    </h3>
                    <Input
                        name="linkedin_url"
                        className="w-full"
                        value={form.linkedin_url}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/johndoe"
                    />
                </div>
                <div className="col-span-12">
                    <h3>
                        notes :
                    </h3>
                    <TextArea
                        name="notes"
                        value={form.notes}
                        style={{ maxWidth: '100%' }}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Experienced frontend developer with React and TypeScript"
                    />
                </div>
            </div>
        </Modal>

        {/*Delete Modal*/}
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
            Are you Sure you want to delete this Candidate
        </Modal>

        <div className="grid grid-cols-12 gap-4 md:gap-6 w-full">
            <Button className="col-span-4 sm:col-span-2" variant="solid" color="cyan" onClick={() => { setOpen(true) }}>
                Add Candidate
            </Button>
            <div className="col-span-8 sm:col-span-4">
                <Input
                    className="w-full"
                    value={inputSearch}
                    onChange={handleChangeSearch}
                    placeholder="John Doe,user7@example.com,+41 79 000 006,Amsterdam"
                />
            </div>
        </div>
        {
            (isLoading) ? <Skeleton className="h-full w-full" paragraph={{ rows: 10 }} />
                : <Table
                    scroll={{ x: "max-content" }
                    }
                    columns={columns}
                    style={{ maxWidth: 1100 }}
                    pagination={{
                        position: ["topRight"],
                        current: page,
                        pageSize: limit,
                        total: total,
                        onChange: (page) => {
                            setPage(page)
                            refetchCandidatesData()
                        },
                    }}
                    dataSource={candidatesData || []} />
        }
    </div>
}
