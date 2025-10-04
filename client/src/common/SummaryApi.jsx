export const baseURL = import.meta.env.VITE_BACKEND_URL

const SummaryApi = {
    register: {
        url: "/api/user/register",
        method: "post"
    },
    refreshToken: {
        url: "/api/user/refresh-token",
        method: "post"
    },
    login: {
        url: "/api/user/login",
        method: "post"
    },
    user_deatails: {
        url: "/api/user/user-details",
        method: "get"
    },
    team_create: {
        url: "/api/teaming/team-create",
        method: "post"
    },
    team_details: {
        url: "/api/teaming/team-details",
        method: "get"
    },
    taskBoard_create: {
        url: "/api/task/create-taskBoard",
        method: "post"
    },
    task_details: {
        url: "/api/task/task-deatails",
        method: "get"
    },
    task_column_create: {
        url: "/api/task/create-column",
        method: "put"
    },
    user_search: {
        url: "/api/user/user-search",
        method: "get"
    },
    logout: {
        url: "/api/user/logout",
        method: "get"
    },
    user_update: {
        url: "/api/user/user-update",
        method: "post"
    },
    new_task_create: {
        url: "/api/task/task-create",
        method: "post"
    },
    request_cancelBY_user: {
        url: "/api/user/request-reject",
        method: "post"
    },
    request_acceptBY_user: {
        url: "/api/user/request-accept",
        method: "post"
    },
    task_column_rename: {
        url: "/api/task/task-column-rename",
        method: "post"
    },
    task_column_delete: {
        url: "/api/task/task-delete",
        method: "post"
    },
    get_allChat_details: {
        url: "/api/chat/get-all-participants-details",
        method: "get"
    },
    get_all_messages: {
        url: "/api/chat/get-all-messages",
        method: "post"
    },
    get_group_details: {
        url: "/api/chat/get-group-details",
        method: "get"
    },
    fetch_task_report: {
        url: "/api/task/get-report",
        method: "get"
    },
    fetch_unread_notification: {
        url: "/app/notify/get-unread-notify",
        method: "post"
    },
    fetch_all_notification : {
        url : "/app/notify/get-all-notify",
        method : "post"
    }
}

export default SummaryApi