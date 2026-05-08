import { Skeleton, Table } from "antd";
import type { ColumnType } from "antd/es/table";

type UnPaginatedTableProps<T> = {
    columns: ColumnType<T>[];
    data: T[];
    isLoading?: boolean;
    rows?: number;
};

/**
 * UnPaginatedTable Component
 *
 * Reusable table component without pagination.
 *
 * Features:
 * - All his columns are Sortable 
 * - Displays tabular data using Ant Design Table
 * - Supports loading state with Skeleton
 * - Fully generic (works with any data type)
 * - Pagination disabled (useful for small datasets or embedded tables)
 * - Configurable skeleton row count
 */
export function UnPaginatedTable<T>({
    columns,
    data,
    isLoading,
    rows = 5,
}: UnPaginatedTableProps<T>) {
    return (
        <div>
            {isLoading ? (
                <Skeleton className="h-full w-full" paragraph={{ rows }} />
            ) : (
                <Table
                    scroll={{ x: "max-content" }}
                    columns={columns}
                    style={{ maxWidth: 1100 }}
                    pagination={false}
                    dataSource={data || []}
                />
            )}
        </div>
    );
}