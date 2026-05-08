import { Link } from "react-router-dom";

type KanbanProps<T> = {
    data: Record<string, T[]>;
    isLoading?: boolean;
};

/**
 * KanbanView Component
 *
 * Displays data grouped by status in a Kanban board layout.
 *
 * Features:
 * - Responsive layout (horizontal scroll on mobile, grid on desktop)
 * - Groups items by status dynamically
 * - Displays application/job information per card
 * - Links to candidate detail pages
 */
export function KanbanView<
    T extends {
        id: string;
        job_title?: string;
        candidate_name?: string;
        candidate_id?: string;
        applied_at?: string;
    }
>({ data, isLoading }: KanbanProps<T>) {
    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-6">
            {Object.entries(data || {}).map(([status, items]) => (
                <div key={status} className="min-w-[250px] md:min-w-0">

                    <h3 className="font-bold mb-3 text-lime-500">
                        {status.toUpperCase()}
                    </h3>

                    {items.map((app) => (
                        <div
                            key={app.id}
                            className="border p-3 mb-2 rounded-lg shadow-sm bg-white"
                        >
                            <p className="font-medium">{app.job_title}</p>

                            <p className="text-sm mt-1">
                                <Link
                                    to={`/candidate/detail/${app?.candidate_id}`}
                                    className="text-purple-700 hover:text-purple-900"
                                >
                                    {app.candidate_name}
                                </Link>
                            </p>

                            <p className="font-medium">
                                {app?.applied_at?.slice(0, 10)}
                            </p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}