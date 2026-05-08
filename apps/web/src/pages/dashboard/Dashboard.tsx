import {
    VictoryBar,
    VictoryChart,
    VictoryLine,
    VictoryPie,
    VictoryTheme,
    VictoryTooltip
} from "victory";
import { MetricCard } from "../../components/MetricCard";
import { useQuery } from "@tanstack/react-query";
import { getApplicationsByStatus, getApplicationsGroupedByWeek, getHiredThisMonth, getLatestApplications, getRejectionRate, getStatusDistribuation, getTotalApplications, getTotalCandidates } from "../../axios/dashboard";
import { ApplicationStatusEnum } from "../../../../../packages/shared/src/application/application.schema";
import { UnPaginatedTable } from "../../components/UnPaginatedTable";
import type { ResponseApplicationDTO } from "../../../../../packages/shared/src/application/application.dto";
import { Link } from "react-router-dom";
import type { ColumnType } from "antd/es/table";

export default function Dashboard() {
    //Columns
    const columns: ColumnType<ResponseApplicationDTO>[] = [
        {
            title: "Candidate",
            dataIndex: "candidate_name",
            sorter: (a: ResponseApplicationDTO, b: ResponseApplicationDTO) => (a.candidate_name ?? '').localeCompare(b.candidate_name ?? ''),
            render: (value: string, record: ResponseApplicationDTO) => (
                <Link to={`/candidate/detail/${record.candidate_id}`} >{value}</Link>)
        },
        {
            title: "JOB",
            dataIndex: "job_title",
            sorter: (a: ResponseApplicationDTO, b: ResponseApplicationDTO) => (a.job_title ?? '').localeCompare(b.job_title ?? ''),
        },
        {
            title: "Status",
            dataIndex: "status",
            sorter: (a: ResponseApplicationDTO, b: ResponseApplicationDTO) => (a.status ?? '').localeCompare(b.status ?? ''),
        },
        {
            title: "Company",
            dataIndex: "company",
            sorter: (a: ResponseApplicationDTO, b: ResponseApplicationDTO) => (a.company ?? '').localeCompare(b.company ?? ''),
        },
        {
            title: "Expected Salary",
            dataIndex: "salary_expectation",
            sorter: (a: ResponseApplicationDTO, b: ResponseApplicationDTO) => (a.salary_expectation ?? 0) - (b.salary_expectation ?? 0),
        },
        {
            title: "Date of Applying",
            dataIndex: "applied_at",
            sorter: (a: ResponseApplicationDTO, b: ResponseApplicationDTO) =>
                new Date(a.applied_at ?? 0).getTime() - new Date(b.applied_at ?? 0).getTime(),
            render: (value: string) => value?.slice(0, 10)
        }
    ];
    //Getting Metrics Data 
    const { data: totalCandidates } = useQuery({
        queryKey: ["totalCandidates"],
        queryFn: async () => {
            const res = await getTotalCandidates();
            return res
        }
    })
    const { data: totalApplications } = useQuery({
        queryKey: ["totalApplications"],
        queryFn: async () => {
            const res = await getTotalApplications();
            return res
        }
    })
    const { data: screeningApplication } = useQuery({
        queryKey: ["screeningApplication"],
        queryFn: async () => {
            const res = await getApplicationsByStatus(ApplicationStatusEnum.screening);
            return res
        }
    })
    const { data: interviewingApplication } = useQuery({
        queryKey: ["interviewingApplication"],
        queryFn: async () => {
            const res = await getApplicationsByStatus(ApplicationStatusEnum.interview);
            return res
        }
    })
    const { data: offeringApplication } = useQuery({
        queryKey: ["offeringApplication"],
        queryFn: async () => {
            const res = await getApplicationsByStatus(ApplicationStatusEnum.offer);
            return res
        }
    })
    const { data: hiredApplication } = useQuery({
        queryKey: ["hiredApplication"],
        queryFn: async () => {
            const res = await getApplicationsByStatus(ApplicationStatusEnum.hired);
            return res
        }
    })
    const { data: rejectedApplication } = useQuery({
        queryKey: ["rejectedApplication"],
        queryFn: async () => {
            const res = await getApplicationsByStatus(ApplicationStatusEnum.rejected);
            return res
        }
    })
    const { data: appliedApplication } = useQuery({
        queryKey: ["appliedApplication"],
        queryFn: async () => {
            const res = await getApplicationsByStatus(ApplicationStatusEnum.applied);
            return res
        }
    })
    const { data: hiredThisMonth } = useQuery({
        queryKey: ["hiredThisMonth"],
        queryFn: async () => {
            const res = await getHiredThisMonth();
            return res
        }
    })
    const { data: rejectionRate } = useQuery({
        queryKey: ["rejectionRate"],
        queryFn: async () => {
            const res = await getRejectionRate();
            return res
        }
    })
    const { data: latestApplications } = useQuery({
        queryKey: ["latestApplications"],
        queryFn: async () => {
            const res = await getLatestApplications();
            console.log(res)
            return res
        }
    })
    const { data: statusDistribuation } = useQuery({
        queryKey: ["statusDistribuation"],
        queryFn: async () => {
            const res = await getStatusDistribuation();
            return res
        }
    })
    const { data: applicationsGroupedByWeek } = useQuery({
        queryKey: ["applicationsGroupedByWeek"],
        queryFn: async () => {
            const res = await getApplicationsGroupedByWeek();
            return res
        }
    })

    return (
        <div className="flex flex-col gap-4 p-4">

            {/* Row 1 — Key KPIs */}
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 sm:col-span-3">
                    <MetricCard title="Total Candidates" metric={totalCandidates} />
                </div>
                <div className="col-span-6 sm:col-span-3">
                    <MetricCard title="Total Applications" metric={totalApplications} />
                </div>
                <div className="col-span-6 sm:col-span-3">
                    <MetricCard title="Hired This Month" metric={hiredThisMonth} />
                </div>
                <div className="col-span-6 sm:col-span-3">
                    <MetricCard title="Rejection Rate" metric={rejectionRate?.toFixed(2)} content={'%'} />
                </div>
            </div>

            {/* Row 2 — Pipeline Status Breakdown */}
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 sm:col-span-2">
                    <MetricCard title="Applied" metric={appliedApplication} />
                </div>
                <div className="col-span-6 sm:col-span-2">
                    <MetricCard title="Screening" metric={screeningApplication} />
                </div>
                <div className="col-span-6 sm:col-span-2">
                    <MetricCard title="Interview" metric={interviewingApplication} />
                </div>
                <div className="col-span-6 sm:col-span-2">
                    <MetricCard title="Offer" metric={offeringApplication} />
                </div>
                <div className="col-span-6 sm:col-span-2">
                    <MetricCard title="Hired" metric={hiredApplication} />
                </div>
                <div className="col-span-6 sm:col-span-2">
                    <MetricCard title="Rejected" metric={rejectedApplication} />
                </div>
            </div>

            {/* Row 3 — Charts */}
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 sm:col-span-4">
                    <VictoryChart
                        domainPadding={{ x: 30 }}
                        theme={VictoryTheme.clean}
                        height={400}
                    >
                        <VictoryBar
                            data={statusDistribuation?.map((e: { _count: number; status: string }) => ({
                                x: e.status,
                                y: e._count,
                            }))}
                            labelComponent={<VictoryTooltip />}
                            labels={({ datum }) => datum.y}
                            barWidth={30}
                        />
                    </VictoryChart>
                </div>
                <div className="col-span-12 sm:col-span-4">
                    <VictoryChart theme={VictoryTheme.clean} height={400}>
                        <VictoryLine
                            data={Object.entries(applicationsGroupedByWeek ?? {}).map(([date, count]) => ({
                                x: date,
                                y: count as number,
                            }))}
                            labels={({ datum }) => datum.y}
                        />
                    </VictoryChart>
                </div>
                <div className="col-span-12 sm:col-span-4">
                    <VictoryPie
                        innerRadius={50}
                        theme={VictoryTheme.clean}
                        height={400}
                        padAngle={5}
                        data={statusDistribuation?.map((e: { _count: number; status: string }) => ({
                            x: e.status,
                            y: e._count,
                        }))}
                        labels={({ datum }) =>
                            `${datum.x}\n${((datum.y / totalApplications) * 100).toFixed(2)}%`
                        }
                    />
                </div>
            </div>

            {/* Row 4 — Latest Applications */}
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 flex justify-items-start text-xl text-cyan-900">
                    Latest Applications
                </div>
                <div className="col-span-12">
                    <UnPaginatedTable columns={columns} data={latestApplications ?? []} />
                </div>
            </div>

        </div>
    );
}