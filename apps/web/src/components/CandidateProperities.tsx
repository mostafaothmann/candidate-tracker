import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input } from "antd";
import TextArea from "antd/es/input/TextArea";

import type { ResponseCandidateDTO } from "../../../../packages/shared/src/candidate/candidate.dto";

type CandidateProperitiesProps = {
    candidateProperitiesProps: ResponseCandidateDTO;
};

/**
 * CandidateProperities Component
 *
 * Displays detailed information about a candidate.
 *
 * Features:
 * - Shows candidate profile fields (name, email, phone, location, LinkedIn, notes)
 * - Fields are read-only (disabled inputs)
 * - Provides navigation to update candidate page
 */
export function CandidateProperities({
    candidateProperitiesProps,
}: CandidateProperitiesProps) {
    const [form, setForm] = useState(candidateProperitiesProps);

    const navigate = useNavigate();

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;

        setForm((prev) => {
            return {
                ...prev,
                [name]: value,
            };
        });
    }

    return (
        <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>name :</h3>
                <Input
                    disabled
                    name="name"
                    className="w-full"
                    value={form?.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                />
            </div>

            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>email :</h3>
                <Input
                    disabled
                    name="email"
                    className="w-full"
                    value={form?.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                />
            </div>

            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>phone :</h3>
                <Input
                    disabled
                    name="phone"
                    className="w-full"
                    value={form?.phone}
                    onChange={handleChange}
                    placeholder="031567123321"
                />
            </div>

            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>location :</h3>
                <Input
                    disabled
                    name="location"
                    className="w-full"
                    value={form?.location}
                    onChange={handleChange}
                    placeholder="Berlin, Germany"
                />
            </div>

            <div className="col-span-12 xl:col-span-4 sm:col-span-6">
                <h3>linkedIn :</h3>
                <Input
                    disabled
                    name="linkedin_url"
                    className="w-full"
                    value={form?.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/johndoe"
                />
            </div>

            <div className="col-span-12">
                <h3>notes :</h3>
                <TextArea
                    disabled
                    name="notes"
                    value={form?.notes}
                    style={{ maxWidth: "100%" }}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Experienced frontend developer with React and TypeScript"
                />
            </div>

            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12">
                    <Button onClick={() => navigate(`/candidate/update/${form.id}`)}>
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
}