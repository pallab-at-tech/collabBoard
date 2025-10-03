import { createBrowserRouter } from 'react-router-dom'
import App from "../App"
import Home from '../pages/Home'
import SigninPage from '../pages/SigninPage'
import SignupPage from '../pages/SignupPage'
import TeamBoard from '../components/other/TeamBoard'
import MainTeamBoard from '../components/other/MainTeamBoard'
import TeamBoardEdit from '../components/other/TeamBoardEdit'
import MobileForCollabBoard from '../pages/MobileForCollabBoard'
import ProfilePage from '../pages/ProfilePage'
import Timeline from '../pages/Timeline'
import EditProfile from '../pages/EditProfile'
import CollabBoard from "../pages/CollabBoard"
import ProfileTeamRequest from '../pages/ProfileTeamRequest'
import ChatPage from '../pages/ChatPage'
import MessagePage from '../pages/MessagePage'
import MessageEdit from '../components/messageComponenet/MessageEdit'
import TrackTaskBoard from '../components/common/TrackTaskBoard'
import DeadlineTaskBoard from '../components/common/DeadlineTaskBoard'
import StatusTaskBoard from '../components/common/StatusTaskBoard'
import SeparateTabForTask from '../pages/SeparateTabForTask'
import SubmitTaskReport from '../pages/SubmitTaskReport'
import ShowColumnForTrack from '../components/TaskBoard/ShowColumnForTrack'
import NotificationPage from '../pages/NotificationPage'

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,

        children: [
            {
                path: '',
                element: <Home />
            },
            {
                path: '/board/:user',
                element: <CollabBoard />,
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
                                children : [
                                    {
                                        path : "col",
                                        element : <ShowColumnForTrack/>
                                    }
                                ]
                            },
                            {
                                path: "deadline",
                                element: <DeadlineTaskBoard />
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
            },
            {
                path: "/task/:id/report",
                element: <SubmitTaskReport />
            },
            {
                path: "/profile/:user",
                element: <ProfilePage />,
                children: [
                    // {
                    //     path : '',
                    //     element : <Timeline/>
                    // },
                    // /profile/:user/request
                    {
                        path: "",
                        element: <ProfileTeamRequest />
                    },
                    {
                        path: "/profile/:user/chat",
                        element: <ChatPage />
                    },
                    {
                        path: '/profile/:user/edit',
                        element: <EditProfile />
                    }
                ]
            },
            {
                path: "/chat",
                element: <ChatPage />,
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
        path : "/notifications",
        element : <NotificationPage/>
    }
])

export default router