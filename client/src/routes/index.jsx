import { createBrowserRouter } from 'react-router-dom'
import App from "../App"
import SigninPage from '../pages/AuthPage/SigninPage'
import SignupPage from '../pages/AuthPage/SignupPage'
import FeaturePage from '../pages/OtherPage/FeaturePage'
import AboutPage from '../pages/OtherPage/AboutPage'

import { lazy } from 'react'
import ErrorPage from '../pages/ErrorPage'
import PageNotFound from '../pages/PageNotFound'

const Home = lazy(() => import("../pages/Home"))
const CollabBoard = lazy(() => import("../pages/BoardPage/CollabBoard"))
const MobileForCollabBoard = lazy(() => import("../pages/BoardPage/MobileForCollabBoard"))
const TeamBoard = lazy(() => import("../pages/BoardPage/TeamBoard"))
const MainTeamBoard = lazy(() => import("../pages/BoardPage/MainTeamBoard"))
const TeamBoardEdit = lazy(() => import("../components/BoardComponent/TeamBoardEdit"))
const TrackTaskBoard = lazy(() => import("../pages/BoardPage/TrackTaskBoard"))
const ShowColumnForTrack = lazy(() => import("../components/BoardComponent/ShowColumnForTrack"))
const StatusTaskBoard = lazy(() => import("../pages/BoardPage/StatusTaskBoard"))
const ReportStructure = lazy(() => import("../components/Others/OtherTask/ReportStructure"))
const SeparateTabForTask = lazy(() => import("../pages/BoardPage/SeparateTabForTask"))
const SubmitTaskReport = lazy(() => import("../pages/BoardPage/SubmitTaskReport"))
const ProfilePage = lazy(() => import("../pages/ProfilePage/ProfilePage"))
const ProfileTeamRequest = lazy(() => import("../components/ProfileComponent/ProfileTeamRequest"))
const ChatPage = lazy(() => import("../pages/ChatPage/ChatPage"))
const MessagePage = lazy(() => import("../pages/ChatPage/MessagePage"))
const MessageEdit = lazy(() => import("../components/ChatComponent/MessageEdit"))
const NotificationPage = lazy(() => import("../pages/NotificationPage"))



const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: '',
                element: <Home />,
                errorElement: <ErrorPage />
            },
            {
                path: '/board/:user',
                element: <CollabBoard />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: '',
                        element: <MobileForCollabBoard />
                    },
                    {
                        path: ':team',
                        element: <TeamBoard />,
                        children: [
                            {
                                path: '',
                                element: <MainTeamBoard />
                            },
                            {
                                path: 'edit',
                                element: <TeamBoardEdit />
                            },
                            {
                                path: "track",
                                element: <TrackTaskBoard />,
                                children: [
                                    {
                                        path: "col",
                                        element: <ShowColumnForTrack />
                                    }
                                ]
                            },
                            {
                                path: "status",
                                element: <StatusTaskBoard />
                            }
                        ]
                    },
                ]

            },
            {
                path: "/task/:id",
                element: <SeparateTabForTask />,
                errorElement: <ErrorPage />
            },
            {
                path: "/task/:id/report",
                element: <SubmitTaskReport />,
                errorElement: <ErrorPage />
            },
            {
                path: "/profile/:user",
                element: <ProfilePage />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: "",
                        element: <ProfileTeamRequest />
                    }
                ]
            },
            {
                path: "/chat",
                element: <ChatPage />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: "/chat/:conversation",
                        element: <MessagePage />,
                        children: [
                            {
                                path: "/chat/:conversation/edit",
                                element: <MessageEdit />
                            },
                        ]
                    },
                ]
            },
            {
                path: "/notifications",
                element: <NotificationPage />,
                errorElement: <ErrorPage />
            },
            {
                path: "/features",
                element: <FeaturePage />,
                errorElement: <ErrorPage />
            },
            {
                path: "/about",
                element: <AboutPage />,
                errorElement: <ErrorPage />
            },
            {
                path: "/report-download",
                element: <ReportStructure />,
                errorElement: <ErrorPage />
            }
        ]
    },
    {
        path: "/login",
        element: <SigninPage />
    },
    {
        path: "/signup",
        element: <SignupPage />
    },
    {
        path: "*",
        element: <PageNotFound />
    }
])

export default router