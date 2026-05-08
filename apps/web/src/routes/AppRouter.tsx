
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Applications from "../pages/application/Applications";
import MainLayout from "../layout/MainLayout";
import { UpdateCandidate } from "../pages/candidate/UpdateCandidate";
import { UpdateApplication } from "../pages/application/UpdateApplication";
import Dashboard from "../pages/dashboard/Dashboard";
import Candidates from "../pages/candidate/Candidates";
import Candidate from "../pages/candidate/Candidate";
import { Application } from "../pages/application/Application";



export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes >
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/candidates" element={<Candidates />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="/candidate/detail/:id" element={<Candidate />} />
                    <Route path="/application/detail/:id" element={<Application />} />
                    <Route path="/candidate/update/:id" element={<UpdateCandidate />} />
                    <Route path="/application/update/:id" element={<UpdateApplication />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}