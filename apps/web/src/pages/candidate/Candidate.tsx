import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCandidateDetail } from "../../axios/candidate";
import { Button, ConfigProvider, Skeleton, Tabs } from "antd";
import { useQuery } from "@tanstack/react-query";
import { CandidateApplications } from "../../components/CandidateApplications";
import { CandidateProperities } from "../../components/CandidateProperities";

/**
 * Candidates Page
 *
 * Responsibilities:
 * - List candidates with pagination + search
 * - Create new candidate
 * - Delete candidate
 * - Create application from candidate
 */

export default function Candidate() {
    const { id } = useParams();
    const [activeKey, setActiveKey] = useState("1");
    //getting data 
    const { data: candidateProperities, isLoading } = useQuery({
        queryKey: ["candidate", id],
        queryFn: async () => {
            const res = await getCandidateDetail(id || "");
            return res
        }
    })
    const renderContent = () => {
        if (isLoading || !candidateProperities) return <Skeleton paragraph={{ rows: 6 }} />;
        switch (activeKey) {
            case "1":
                return <div>
                    {/*Details for the candidate*/}
                    <CandidateProperities candidateProperitiesProps={candidateProperities} />
                </div>;
            case "2":
                return <div>
                    {/*Applications for the candidate*/}
                    <CandidateApplications tableData={candidateProperities.applications} isLoading={isLoading} />
                </div>;
            default:
                return null;
        }
    }
    const tabsItems = [
        {
            label: <div>Candidate Details</div>, key: "1",
        },
        {
            label: <div>Applications</div>, key: "2",
        }
    ]
    //showModal
    const navigate = useNavigate();

    return <div className="grid grid-cols-12 gap-2">
        <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12">
                <Button onClick={() => navigate(-1)}>
                    Back
                </Button>
            </div>
        </div>
        <div className="col-span-12">
            <ConfigProvider direction="ltr" >
                <Tabs
                    defaultActiveKey="1"
                    tabPlacement={'top'}
                    onChange={setActiveKey}
                    style={{
                        borderColor: "#592C46",
                    }}
                    items={tabsItems}

                    tabBarStyle={{ height: 50, maxWidth: "100%", marginRight: 0 }}
                />
            </ConfigProvider>

            {/* Content in another place */}
            <div style={{ padding: 20, maxHeight: 200, maxWidth: '100%', }}>
                {renderContent()}
            </div>
        </div>
    </div>;
}