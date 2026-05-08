import { notification } from "antd";

/**
 * Shows a success notification.
 *
 * Used for successful API operations like create, update, delete, etc.
 */
export function handleSuccessNotification(
    message: string,
    description: string
) {
    notification.success({
        message: message || "Success",
        description: description || "Successfully Done",
        placement: "bottomLeft",
    });
}

/**
 * Shows an error notification.
 *
 * Used for failed API operations or unexpected errors.
 */
export function handleErrorNotification(
    message: string,
    description: string
) {
    notification.error({
        message: message || "Submission Failed",
        description: description || "Please try again",
        placement: "bottomLeft",
    });
}