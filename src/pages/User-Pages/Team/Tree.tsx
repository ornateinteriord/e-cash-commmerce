import { Box, Typography, Avatar, Card, CardContent, ClickAwayListener,  } from '@mui/material';
import { useEffect, useState } from 'react';
import { useGetSponsers } from '../../../api/Memeber';
import { toast } from 'react-toastify';
import LoadingComponent from '../../../components/common/LoadingComponent';
import DataTable from "react-data-table-component";
import "./Tree.scss";
import { getFormattedDate } from '../../../utils/common';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomBreadcrumbs, { breadcrumbsProp } from "../../../components/common/CustomBreadcrumps";
import TokenService from "../../../api/token/tokenService";



const Tree = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [hoveredSponsor, setHoveredSponsor] = useState<{
    Name: string;
    status: string;
    Date_of_joining: string;
    direct_referrals?: string[];
    total_team?: number;
    wallet_balance?: number;
  } | null>(null);

  const memberId = searchParams.get("memberId") || TokenService.getMemberId()

  const { data: sponsers, isLoading, isError, error } = useGetSponsers(memberId);

  const parentUser = sponsers?.parentUser;

  const handleSponsorClick = (sponsorId: string) => {
    navigate(`?memberId=${sponsorId}`, { replace: true });
  };
  useEffect(() => {
    if (isError) toast.error(error.message);
  }, [isError, error]);


  const sponsored = Array.isArray(sponsers?.sponsoredUsers) ? sponsers.sponsoredUsers : [];

  const columns = [
    { selector: (row: any) => row.field, sortable: true },
    { selector: (row: any) => row.value },
  ];
  const data = hoveredSponsor ? [
    { field: "Member Name", value: hoveredSponsor.Name },
    { field: "Status", value: hoveredSponsor.status },
    { field: "Direct", value: hoveredSponsor.direct_referrals?.length || 0 },
    { field: "Team", value: hoveredSponsor.total_team || 0 },
    { field: "Activation Date", value: getFormattedDate(hoveredSponsor.Date_of_joining) },
    { field: "Club", value: "2K" },
    { field: "Earnings", value: `Rs. ${hoveredSponsor.wallet_balance || 0}` },
  ] : []

  // Get avatar background color based on status
  const getAvatarBackgroundColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'inactive') {
      return '#ff6b6b';
    } else if (statusLower === 'active') {
      return '#51cf66';
    }
    return '#0a2558';
  };

  // Main user profile component
  const UserProfile = ({ userDetails }: { userDetails: any }) => (

    <Box
      className="sponsor-container"
      onClick={() => handleSponsorClick(userDetails.Member_id)}
      onMouseEnter={() => setHoveredSponsor(userDetails)}
    >
      <>
        <Box
          className="sponsor-avatar"
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: getAvatarBackgroundColor(userDetails?.status),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F172A',
            fontWeight: 'bold',
            fontSize: '1rem',
            backgroundImage: userDetails?.profile_image ? `url(${userDetails.profile_image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!userDetails?.profile_image && userDetails?.Name?.charAt(0).toUpperCase()}
        </Box>
        <Typography variant="body2" fontWeight="bold">
          {userDetails?.Name}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {userDetails?.Member_id}
        </Typography>
      </>
    </Box>
  );

  // Sponsored user component
  const SponsoredProfile = ({ user }: { user: any }) => (
    <Box
      className="sponsor-container"
      onClick={() => handleSponsorClick(user.Member_id)}
      onMouseEnter={() => setHoveredSponsor(user)}
    >
      <>
        <Avatar
          className="sponsor-avatar"
          src={user.profile_image || ""}
          sx={{
            backgroundColor: getAvatarBackgroundColor(user?.status),
          }}
        >
          {!user.profile_image && user.Name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="body2" fontWeight="bold">
          {user.Name}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {user.Member_id}
        </Typography>
      </>
    </Box>
  );

  const routes: breadcrumbsProp[] = [
    { path: "/user/team/tree", breadcrumb: "Tree" },
    { path: `/user/team/tree?memberId=${memberId}`, breadcrumb: "Sponsores" },
  ];


  return (
    <Card sx={{ margin: "1rem", mt: 10 }}>
      <CardContent>
        <CustomBreadcrumbs routes={routes} />
        <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>Tree</div>
          <Box className="tree-container">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <UserProfile userDetails={parentUser} />


                {sponsored.length > 0 && (
                  <Box
                    className="SponsoredProfile"

                  >
                    {sponsored.map((user: any) => (
                      <SponsoredProfile key={user.Member_id} user={user} />
                    ))}
                  </Box>
                )}
              </Box>
              {!isLoading && hoveredSponsor && (
                <ClickAwayListener onClickAway={() => setHoveredSponsor(null)}>
                  <Box className="sponsor-popup-container">
                    <Box
                      className="sponsor-popup"

                    >
                      <Typography
                        variant="h6"
                        sx={{ textAlign: "center", mb: 0 }}
                      >
                        {hoveredSponsor.Name}'s Details
                      </Typography>
                      <DataTable
                        columns={columns}
                        data={data}
                        dense
                        customStyles={{
                          cells: {
                            style: {
                              padding: "4px",
                            },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </ClickAwayListener>
              )}
            </Box>
      </CardContent>
      {isLoading && <LoadingComponent />}
    </Card>
  );
};

export default Tree;
