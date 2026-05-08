type MetricCardInterface = {
    title: string;
    content?: string;
    metric: number;
};

/**
 * MetricCard Component
 *
 * Displays a dashboard metric in a styled card format.
 *
 * Features:
 * - Shows metric title
 * - Displays numeric value
 * - Optional content suffix (e.g. %, $, etc.)
 */
export function MetricCard(metricCard: MetricCardInterface) {
    return (
        <div className="w-full col-span-full rounded-2xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-white/[0.03] ">
            <div className="text-cyan-800 text-xs">
                {metricCard.title}
            </div>

            <div className="mt-1">
                {metricCard.metric}
                {metricCard.content}
            </div>
        </div>
    );
}