import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, put } from '../Api';
import { toast } from 'react-toastify';

export const useUpdatePassword = () =>{
  return useMutation({
    mutationFn:async(passwordData:any) =>{
    return await put("/admin/update-password",passwordData);
    },
    onSuccess:(response)=>{
      if(response.success){
        toast.success(response.message)
      }else{
        console.error( response.message)
      }
    },
    onError:(error:any)=>{
      toast.error(error.response.data.message)
    }
  })
}

export const useImpersonate = () => {
  return useMutation({
    mutationFn: async (memberId: string) => {
      return await post("/auth/impersonate", { memberId });
    },
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Impersonation failed");
    }
  });
};

export const useGetAllMembersDetails = () =>{
    return useQuery({
        queryKey:["allMembers"],
        queryFn: async() =>{
            const response = await get("/admin/members")
            if(response.success){
                return response.members
            }else{
                throw new Error(response.message || "Failed to fetch members")
            }
        }
    })
}

export const useGetCustomerTokens = () => {
  return useQuery({
    queryKey: ["customerTokens"],
    queryFn: async () => {
      const response = await get("/admin/customer-tokens");
      if (response.success) {
        return response.customers || [];
      } else {
        throw new Error(response.message || "Failed to fetch customer tokens");
      }
    }
  });
};

export const useGetVendorUplines = (vendorId: string | null) => {
  return useQuery({
    queryKey: ["vendorUplines", vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await get(`/admin/upline-tree/vendor/${vendorId}`);
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch vendor uplines");
      }
    },
    enabled: !!vendorId
  });
};

export const useGetCustomerUplines = (customerId: string | null) => {
  return useQuery({
    queryKey: ["customerUplines", customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const response = await get(`/admin/upline-tree/customer/${customerId}`);
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch customer uplines");
      }
    },
    enabled: !!customerId
  });
};

export const useGetVendorTokenContributors = (vendorId: string | null) => {
  return useQuery({
    queryKey: ["vendorTokenContributors", vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await get(`/admin/token-contributors/vendor/${vendorId}`);
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch vendor token contributors");
      }
    },
    enabled: !!vendorId
  });
};

export const useGetCustomerTokenContributors = (customerId: string | null) => {
  return useQuery({
    queryKey: ["customerTokenContributors", customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const response = await get(`/admin/token-contributors/customer/${customerId}`);
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch customer token contributors");
      }
    },
    enabled: !!customerId
  });
};

export const useSyncReferralTokens = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await post("/user/sync-referral-tokens", {});
    },
    onSuccess: (response: any) => {
      if (response.success) {
        toast.success(response.message || "Tokens synced successfully!");
        queryClient.invalidateQueries({ queryKey: ["allMembers"] });
      } else {
        toast.error(response.message || "Failed to sync tokens");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to sync tokens");
    }
  });
};

export const  useGetMemberDetails =(memberId:any)=>{
  return useQuery({
    queryKey:["members",memberId],
    queryFn:async()=>{
      const response = await get(`/admin/get-member/${memberId}`)
      if(response.success){
        return response.member
      }else{
        throw new Error(response.message)
      }
    },
    enabled: !!memberId,
  })
}

export const useUpdateMemberbyId=()=>{
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn:async({memberId,data}:{memberId:any;data:any})=>{
        return await put(`/admin/update-member/${memberId}`,data)
    },
    onSuccess:(response)=>{
      if(response.success){
        toast.success(response.message)
        queryClient.invalidateQueries({ queryKey: ["members"] });  
      }  else {
        toast.error(response.message);
      }
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.message || "An unknown error occurred ";
      toast.error(errorMessage);
    },
  })
}


export const useGetAllTransactionDetails = () => {
  return useQuery({
    queryKey: ["AllTransactionDetails"],
    queryFn: async () => {
      const response = await get("/admin/transactions");
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch all transactions");
      }
    },
  });
};

export const useGetAllTickets = ()=>{
  return useQuery({
    queryKey:["AllTickets"],
    queryFn:async () =>{
      const response = await get("/admin/tickets")
      if(response.success){
        return response.tickets;
      }else{
        throw new Error(response.message || "Failed to fetch all transactions");
      }
    }
  })
}

export const useUpdateTickets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reply_details }: { id: string; reply_details: string })=> {
     return await put(`/admin/ticket/${id}`, { reply_details });
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({queryKey:["AllTickets"]})
      
      } else {
        toast.error(response.message);
      }
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "An unknown error occurred while updating the ticket";
      toast.error(errorMessage);
    },
  });
};

export const getEpinsSummary = () => {
  return useQuery({
      queryKey: ["epinsSummary"],
      queryFn: async () => {
          const response = await get("/admin/epin-summary");
          if (response.success) {
              return response.data;
          } else {
              throw new Error(response.message || "Failed to fetch E-Pin summary");
          }
      }
  });
};

export const useGetNews = ()=>{
  return useQuery({
    queryKey:["news"],
    queryFn:async ()=>{
      const response = await get("/admin/getnews")
      if(response.success){
        return response.news
      }else{
        throw new Error(response.message)
      }
    }
  });
};

export const useAddNews = ()=>{
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn:async(newsData:any) =>{
    return await post("/admin/addnews",newsData);
    },
    onSuccess:(response)=>{
      if(response.success){
        toast.success(response.message)
        queryClient.invalidateQueries({queryKey:["news"]})
        return response.news
      }else{
        console.error( response.message)
      }
     
    },
    onError:(error:any)=>{
      toast.error(error.response.data.message)
    }
  })
}

export const useGetHoliday = ()=>{
  return useQuery({
    queryKey:["holiday"],
    queryFn:async ()=>{
      const response = await get("/admin/getholiday")
      if(response.success){
        return response.holiday
      }else{
        throw new Error(response.message)
      }
    }
  })
}

export const useAddHoliday = ()=>{
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn:async(holidayData:any) =>{
    return await post("/admin/addholiday",holidayData);
    },
    onSuccess:(response)=>{
      if(response.success){
        toast.success(response.message)
        queryClient.invalidateQueries({queryKey:["holiday"]})
        return response.news
      }else{
        console.error( response.message)
      }
    },
    onError:(error:any)=>{
      toast.error(error.response.data.message)
    }
  })
}

export const useGeneratePackage =()=>{
  return useMutation({
    mutationFn:async(data:any)=>{
      return await post("/admin/generate-package",data)
    },
    onSuccess:(response)=>{
      if(response.success){
        toast.success(response.message)
      }else{
        console.error( response.message)
      }
    },
    onError:(error:any)=>{
      toast.error(error.response.data.message)
    }
  })
}


export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, status, upgrade_status }: { memberId: any; status?: any; upgrade_status?: any }) => {
      const response = await put(`/admin/update-status/${memberId}`, { status, upgrade_status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMembers'] });

    },
    onError: (error) => {
      console.error('Error updating member status:', error);
      toast.error('Failed to activate member. Please try again.');
    }
  });
};

export const useGetAllDailyPayouts = () => {
  return useQuery({
    queryKey: ["admin-daily-payouts"],
    queryFn: async () => {
      const response = await get("/admin/all-daily-payouts"); 
      console.log('123:',response);
      if (response?.success) {
        return response?.data?.daily_earnings || [];
        
      } else {
        throw new Error(response?.data?.message || "Failed to fetch all daily payouts");
      }
    },
  });
};

export const useGetROISummary = () => {
  return useQuery({
    queryKey: ["admin-roi-summary"],
    queryFn: async () => {
      const response = await get("/admin/roi-summary");
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch ROI summary");
      }
    },
  });
};

export const useGetROIBenefits = () => {
  return useQuery({
    queryKey: ["admin-roi-benefits"],
    queryFn: async () => {
      const response = await get("/admin/roi-benefits");
      if (response.success) {
        return response.data.roi_benefits || [];
      } else {
        throw new Error(response.message || "Failed to fetch ROI benefits");
      }
    },
  });
};

export const useGetLevelRoiSchedules = (memberId?: string) => {
  return useQuery({
    queryKey: ["admin-level-roi-schedules", memberId],
    queryFn: async () => {
      const url = memberId ? `/admin/level-roi-schedules/${memberId}` : "/admin/level-roi-schedules";
      const response = await get(url);
      if (response.success) {
        return response.data || [];
      } else {
        throw new Error(response.message || "Failed to fetch Level ROI schedules");
      }
    },
  });
};


export const useTriggerDailyROI = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload?: {
      date?: string;
      specificDateOnly?: boolean;
      type?: "all" | "daily_incentive" | "level_roi";
      memberId?: string;
    }) => {
      return await post("/admin/trigger-roi", payload || {});
    },
    onSuccess: (response: any) => {
      if (response?.success) {
        toast.success(response.message || "ROI Sync triggered successfully");
        queryClient.invalidateQueries({ queryKey: ["admin-daily-payouts"] });
        queryClient.invalidateQueries({ queryKey: ["admin-roi-summary"] });
        queryClient.invalidateQueries({ queryKey: ["admin-level-roi-schedules"] });
        queryClient.invalidateQueries({ queryKey: ["admin-roi-benefits"] });
        queryClient.invalidateQueries({ queryKey: ["AllTransactionDetails"] });
      } else {
        toast.error(response?.message || "ROI Sync failed");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to trigger ROI Sync");
    },
  });
};

export const useTriggerAutoUpgrades = () => {
  return useMutation({
    mutationFn: async () => {
      return await post("/admin/trigger-auto-upgrades", {});
    },
    onSuccess: (response: any) => {
      if (response.success) {
        toast.success(`Auto Upgrades triggered successfully. Processed: ${response.processedCount || 0}`);
      } else {
        toast.error(response.message || "Auto Upgrades failed");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to trigger Auto Upgrades");
    },
  });
};





// Single unified hook for both pending and processed loans
export const useGetRewardLoansByStatus = (status:any) => {
  return useQuery({
    queryKey: ["rewardLoans", status], // Include status in queryKey for proper caching
    queryFn: async () => {
      const response = await get(`/admin/reward-loans/${status}`);
      console.log('Reward Loans Response:', response);
      if (response.success) {
        return response?.data || { loans: [], totalCount: 0 };
      } else {
        throw new Error(response.message || "Failed to fetch reward loans");
      }
    },
    enabled: !!status, // Only run query if status is provided
  });
};

export const useUpdateRewardLoanStatus = () => {
  return useMutation({
    mutationFn: async (data: { 
      memberId: string; 
      action: 'approve' | 'reject';
    }) => {
      const response = await put(`/admin/reward-loans/${data.memberId}/${data.action}`);
      
      // If put already returns parsed data, just return it directly
      return response;
    },
  });
};

// Add KYC approval hooks
export const useGetKYCSubmissions = (status = "PENDING", q = "", page = 1, limit = 50) => {
  return useQuery({
    queryKey: ["kycSubmissions", status, q, page, limit],
    queryFn: async () => {
      const response = await get("/kyc/submissions", { status, q, page, limit });
      return response;
    },
  });
};

export const useApproveKYC = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ref_no: string) => {
      const response = await post("/kyc/approve", { ref_no });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kycSubmissions"] });
      toast.success("KYC approved successfully");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to approve KYC";
      toast.error(errorMessage);
    },
  });
};
