import React, { useEffect, useState } from "react";
import { Card, CardContent, Button } from '@mui/material';
import "./MemberForm.scss";
import CustomBreadcrumbs, { breadcrumbsProp } from "../../../components/common/CustomBreadcrumps";
import { useGetMemberDetails, useUpdateMemberbyId } from '../../../api/Admin';
import { toast } from 'react-toastify';
import { BasicDetails } from './updated-forms/BasicDetails';
import { BankDetails } from './updated-forms/BankDetails';
import { KYCDocuments } from './updated-forms/KYCDocuments';
import { NomineeDetails } from './updated-forms/NomineeDetails';
import { JoiningDetails } from './updated-forms/JoiningDetails';
import LoadingComponent from '../../../components/common/LoadingComponent';
import { useParams } from 'react-router-dom';

const MembersUpdateForm: React.FC = () => {
  const { memberId } = useParams()
  const [formData, setFormData] = useState<Record<string, string>>({
    gender: "",
  });
  const {
    data: member,
    isLoading,
    isError,
    error,
  } = useGetMemberDetails(memberId);
  useEffect(() => {
    if (isError) {
      const err = error as Error;
      toast.error(err.message);
    }
  }, [isError, error]);

  useEffect(() => {
    if (member) {
      setFormData((prev) => ({ ...prev, ...member, gender: member.gender || "", }));
    }
  }, [member]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      gender: e.target.value,
    }));
  };

  const updateMember = useUpdateMemberbyId();

  const handleSubmit = () => {
    updateMember.mutate({ memberId, data: formData });
  };

  const routes: breadcrumbsProp[] = [
    { path: "/admin/members", breadcrumb: "Members" },
    { path: `/admin/members/${memberId}`, breadcrumb: "Update Member" },
  ];

  return (
    <Card
      sx={{
        margin: "1rem",
        mt: 10,
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      <CardContent>
        <div>
          <CustomBreadcrumbs routes={routes} />
        </div>
        {/* BasicDetails----------------------------------------- */}

        <BasicDetails
          formData={formData}
          handleInputChange={handleInputChange}
          handleRadioChange={handleRadioChange}
        />

        {/* Bank details ----------------------------------- */}

        <BankDetails
          formData={formData}
          handleInputChange={handleInputChange}
        />

        {/* KYC Documents ----------------------------------- */}

        <KYCDocuments formData={formData} />

        {/* Nominee details----------------------------------------- */}

        <NomineeDetails
          formData={formData}
          handleInputChange={handleInputChange}
        />

        {/* joining details----------------------------------------- */}
        <JoiningDetails
          formData={formData}
          handleInputChange={handleInputChange}
        />

        <div className="member-form-btn">
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: "#0a2558",
              alignSelf: "flex-end",
              "&:hover": { backgroundColor: "#581c87" },
            }}
          >
            Update
          </Button>
        </div>
      </CardContent>
      {(isLoading || updateMember.isPending) && <LoadingComponent />}
    </Card>
  );
};

export default MembersUpdateForm;
