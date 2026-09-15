export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US",{
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    })
}

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status && status < 500 && typeof message === "string" && message.length <= 160) {
        return message;
    }

    return fallback;
}