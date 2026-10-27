import { Button, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Edit } from 'lucide-react';
import { getFormattedDate } from './common';
export { getFormattedDate };
import { MemberDetails } from '../store/store';



export const getUserDashboardTableColumns = () => [
  {
    selector: (row: any) => row.title,
    style: { fontWeight: "bold" },
  },
  {
    name: "Direct",
    selector: (row: any) => row.direct,
    center: true,
  },
  {
    name: "Indirect",
    selector: (row: any) => row.indirect,
    center: true,
  },
  {
    name: "Total",
    selector: (row: any) => row.total,
    center: true,
  },
];

export const getUsedPackageColumns = (user: MemberDetails) => {
  return [
    {
      name: "Date",
      selector: (row: any) => getFormattedDate(row.date),
      sortable: true,
      width: "10%"
    },
    {
      name: "Vendor Code",
      selector: (row: any) => `${user.Name} (${row.purchasedby})`,
      sortable: true,
      width: "20%"
    },
    {
      name: "Package Code",
      selector: (row: any) => row.epin_no,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row: any) => `${row.amount.toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Used For",
      selector: (row: any) => row.used_for,
      sortable: true,
      width: "20%"
    },
    {
      name: "Used Date",
      selector: (row: any) => getFormattedDate(row.used_on),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: any) => row.status.charAt(0).toUpperCase() + row.status.slice(1),
      sortable: true,
    },
  ];
};

export const getUnUsedPackageColumns = (user: MemberDetails) => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.date),
    sortable: true,
    width: "12%"
  },
  {
    name: "Code",
    selector: (row: any) => `${user.Name} (${row.purchasedby})`,
    sortable: true,
  },
  {
    name: "Package Code",
    selector: (row: any) => row.epin_no,
    sortable: true,
  },
  {
    name: "Amount",
    selector: (row: any) => `${row.amount.toFixed(2)}`,
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status.charAt(0).toUpperCase() + row.status.slice(1),
    sortable: true,
  },
];

export const getUserPackageHistoryColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.date),
    sortable: true,
  },
  {
    name: "Transfered To",
    selector: (row: any) => row.transfered_to,
    // #TODO: Add username and member id
    sortable: true,
  },
  {
    name: "Qty",
    selector: (row: any) => row.quantity,
    sortable: true,
  },
  {
    name: "Package",
    selector: (row: any) => row.package,
    sortable: true,
  },
];

export const getDirectColumns = () => [
  {
    name: "S No",
    cell: (_: any, index: number) => index + 1,
    sortable: true,
  },
  {
    name: "Vendor",
    selector: (row: any) => `${row.Name} - ${row.Member_id}`,
    sortable: true,
  },
  {
    name: "Mobile No",
    selector: (row: any) => row.mobileno,
    sortable: true,
  },
  {
    name: "DOJ",
    selector: (row: any) => getFormattedDate(row.Date_of_joining),
    sortable: true,
  },
  {
    name: "Sponsor",
    selector: (row: any) => `${row.Sponsor_name} - ${row.Sponsor_code}`,
    sortable: true,
  },
];

export const getLevelBenifitsColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.date),
    sortable: true,
  },
  {
    name: "Payout Level",
    selector: (row: any) => row.payoutLevel,
    sortable: true,
  },
  {
    name: "Vendor Name (ID)",
    selector: (row: any) => `${row.memberName || 'N/A'} (${row.memberId || 'N/A'})`,
    sortable: true,
  },
  {
    name: "Amount",
    selector: (row: any) => row.amount,
    sortable: true,
  },
];

export const getAdminAggregatedIncomeColumns = () => [
  {
    name: "S No",
    cell: (_: any, index: number) => index + 1,
    width: "80px",
  },
  {
    name: "Vendor Name (ID)",
    selector: (row: any) => `${row.name || "-"} (${row.member_id})`,
    sortable: true,
  },
  {
    name: "Total Amount",
    selector: (row: any) => row.totalAmount,
    sortable: true,
    format: (row: any) => `${parseFloat(row.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
];

export const getDailyPayoutColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.transaction_date || row.date),
    sortable: true,
  },
  {
    name: "Description",
    selector: (row: any) => (row.description || "").replace(/\/300/g, '/120'),
    sortable: true,
  },
  {
    name: "Amount",
    selector: (row: any) => `${parseFloat(row.ew_credit || row.amount || 0).toFixed(2)}`,
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status,
    sortable: true,
    cell: (row: any) => (
      <div
        style={{
          color: row.status?.toLowerCase() === "completed" || row.status?.toLowerCase() === "approved" ? "#569f35" : "#ff3860",
          fontWeight: "bold"
        }}
      >
        {row.status}
      </div>
    ),
  },
];

export const getTransactionColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.transaction_date || row.createdAt),
    sortable: true,
    width: "120px"
  },
  {
    name: "Type",
    selector: (row: any) => row.transaction_type || row.benefit_type || "Transaction",
    sortable: true,
    width: "150px",
    cell: (row: any) => (
      <span style={{ fontWeight: 700, color: '#002970', fontSize: '12px' }}>
        {row.transaction_type || row.benefit_type || "Transaction"}
      </span>
    )
  },
  {
    name: "Description",
    selector: (row: any) => row.description || "-",
    sortable: true,
    wrap: true,
  },
  {
    name: "Credit",
    selector: (row: any) => {
      const ew = parseFloat(row.ew_credit || 0);
      const tw = parseFloat(row.tw_credit || 0);
      const uw = parseFloat(row.uw_credit || 0);
      const regular = parseFloat(row.credit || 0);
      const amt = ew > 0 ? ew : (tw > 0 ? tw : (uw > 0 ? uw : regular));
      return amt > 0 ? `${parseFloat(amt.toString()).toLocaleString('en-US')}` : "-";
    },
    sortable: true,
    style: { color: '#059669', fontWeight: 'bold' }
  },
  {
    name: "Debit",
    selector: (row: any) => {
      const ew = parseFloat(row.ew_debit || 0);
      const tw = parseFloat(row.tw_debit || 0);
      const uw = parseFloat(row.uw_debit || 0);
      const regular = parseFloat(row.debit || 0);
      const amt = ew > 0 ? ew : (tw > 0 ? tw : (uw > 0 ? uw : regular));
      return amt > 0 ? `${parseFloat(amt.toString()).toLocaleString('en-US')}` : "-";
    },
    sortable: true,
    style: { color: '#dc2626', fontWeight: 'bold' }
  },
  {
    name: "Balance",
    selector: (row: any) => {
      const amt = row.balance || row.previous_balance;
      return amt ? `${parseFloat(amt).toLocaleString('en-US')}` : "-";
    },
    sortable: true,
    style: { fontWeight: 'bold', color: '#1e293b' }
  },
  {
    name: "Status",
    selector: (row: any) => row.status,
    sortable: true,
    cell: (row: any) => {
      const status = row.status?.toLowerCase() || 'pending';
      const isActive = status === 'active' || status === 'completed' || status === 'approved';
      return (
        <div
          style={{
            color: isActive ? "#059669" : "#dc2626",
            backgroundColor: isActive ? "#ecfdf5" : "#fef2f2",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 800,
            textTransform: 'uppercase'
          }}
        >
          {status}
        </div>
      );
    },
  },
];

export const getBankTransactionColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.transaction_date),
    sortable: true,
  },
  {
    name: "Description",
    selector: (row: any) => (row.description || "").replace(/\/300/g, '/120'),
    sortable: true,
  },
  {
    name: "Reference No",
    selector: (row: any) => row.reference_no || "-",
    sortable: true,
  },
  {
    name: "Credit",
    selector: (row: any) => row.ew_credit ? `${parseFloat(row.ew_credit).toFixed(2)}` : "-",
    sortable: true,
  },
  {
    name: "Debit",
    selector: (row: any) => row.ew_debit ? `${parseFloat(row.ew_debit).toFixed(2)}` : "-",
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status,
    sortable: true,
  },
];

export const getJournalEntriesColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.date),
    sortable: true,
  },
  {
    name: "Description",
    selector: (row: any) => (row.description || "").replace(/\/300/g, '/120'),
    sortable: true,
  },
  {
    name: "Account",
    selector: (row: any) => row.account_name,
    sortable: true,
  },
  {
    name: "Debit",
    selector: (row: any) => `${parseFloat(row.debit || 0).toFixed(2)}`,
    sortable: true,
  },
  {
    name: "Credit",
    selector: (row: any) => `${parseFloat(row.credit || 0).toFixed(2)}`,
    sortable: true,
  },
];



export const getWalletColumns = () => [
  {
    name: "Date",
    selector: (row: any) => row.transaction_date,
    sortable: true,
    cell: (row: any) => new Date(row.transaction_date).toLocaleDateString()
  },
  {
    name: "Transaction ID",
    selector: (row: any) => row.transaction_id,
    sortable: true,
  },
  {
    name: "Type",
    selector: (row: any) => row.transaction_type,
    sortable: true,
    cell: (row: any) => {
      if (row.transaction_type === "Level Benefits") {
        if (row.description && row.description.toLowerCase().includes('referral')) {
          return "Referral Bonus";
        }
        return "Level Bonus";
      }
      return row.transaction_type;
    }
  },
  {
    name: "Description",
    selector: (row: any) => row.description || "-",
    sortable: true,
    wrap: true,
  },
  {
    name: "Amount",
    selector: (row: any) => row.ew_debit,
    sortable: true,
    cell: (row: any) => {

      if (parseFloat(row.ew_debit) > 0) {
        return `-${parseFloat(row.ew_debit).toFixed(2)}`;
      } else {
        return `+${parseFloat(row.ew_credit).toFixed(2)}`;
      }
    }
  },
  {
    name: "Status",
    selector: (row: any) => row.status,
    sortable: true,
    cell: (row: any) => row.status.charAt(0).toUpperCase() + row.status.slice(1)
  }
];

export const getAdminDashboardTableColumns: any = () => [
  {
    name: "Date",
    selector: (row: any) => {
      const date = new Date(row.Date_of_joining || row.date);
      return isNaN(date.getTime()) ? row.Date_of_joining || "-" : date.toLocaleDateString();
    },
    center: true,
    sortable: true,
  },
  {
    name: "Vendor",
    selector: (row: any) => row.Name || row.Member || "-",
    center: true,
    sortable: true,
  },
  {
    name: "Package Amount",
    selector: (row: any) => (row.package_value ? `${row.package_value}` : "-"),
    center: true,
    sortable: true,
  },
];


export const getMembersColumns = (
  showEdit: boolean,
  handleEditClick: (memberId: string) => void,
  handleViewClick?: (memberId: string) => void,
  handleDashboardClick?: (member: any) => void
) => [
    {
      name: "SNo",
      selector: (row: any) => row.sNo,
      sortable: true,
    },
    {
      name: "Vendor Name (ID)",
      selector: (row: any) => `${row.Name ?? "-"} (${row.Member_id})`,
      sortable: true,
    },
    {
      name: "Level",
      selector: (row: any) => row.level ?? 0,
      sortable: true,
      width: "90px",
      center: true,
      cell: (row: any) => (
        <span
          style={{
            backgroundColor: "#ede9fe",
            color: "#6d28d9",
            padding: "3px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {row.level !== undefined && row.level !== null ? row.level : 0}
        </span>
      ),
    },
    {
      name: "Approved On",
      selector: (row: any) => getFormattedDate(row.Date_of_joining),
      sortable: true,
    },
    {
      name: "Password",
      selector: (row: any) => row.password,
      sortable: true,
    },
    {
      name: "Sponsor",
      selector: (row: any) => row.Sponsor_name ?? '-',
      sortable: true,
    },
    {
      name: "Package",
      selector: (row: any) => {
        const primary = Number(row.package_value) || 0;
        const addons = Array.isArray(row.addons) 
          ? row.addons.filter((a: any) => !a.package_id?.startsWith('PKG-P-')).map((a: any) => Number(a.amount)).filter((amt: number) => amt > 0) 
          : [];
        
        let display = '';
        if (primary > 0) display += `${primary}`;
        else if (row.spackage && !row.package_value) return row.spackage;
        
        if (addons.length > 0) {
            display += (display ? ' + ' : '') + addons.map((amt: number) => `${amt}`).join(' + ');
        }
        
        return display || '-';
      },
      sortable: true,
      minWidth: '150px'
    },
    {
      name: "MobileNo",
      selector: (row: any) => row.mobileno,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      sortable: true,
      cell: (row: any) => (
        <div
          style={{
            color: row.status === 'active' ? 'green' : row.status.toLowerCase() === 'pending' ? '#FFC000' : 'red',

            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </div>
      ),
    },
    {
      name: 'Actions',
      cell: (row: any) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {handleDashboardClick && (
            <IconButton
              onClick={() => handleDashboardClick(row)}
              style={{ color: '#0ea5e9', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
              title="Go to Dashboard"
            >
              <DashboardIcon />
            </IconButton>
          )}
          {handleViewClick && (
            <IconButton
              onClick={() => handleViewClick(row.Member_id)}
              style={{ color: '#581c87', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
              title="View Details"
            >
              <VisibilityIcon />
            </IconButton>
          )}
          {showEdit && (
            <IconButton
              onClick={() => handleEditClick(row.Member_id)}
              style={{ color: '#000', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
              title="Edit Vendor"
            >
              <Edit />
            </IconButton>
          )}
        </div>
      ),
    }
  ];

export const getPermissionsColumns = (
  handleToggleStatus: (memberId: string, currentStatus: string) => void,
  isUpdating: boolean
) => [
    {
      name: "SNo",
      selector: (row: any) => row.sNo,
      sortable: true,
      width: "70px",
    },
    {
      name: "Vendor Name (ID)",
      selector: (row: any) => `${row.Name ?? "-"} (${row.Member_id})`,
      sortable: true,
    },
    {
      name: "Package",
      selector: (row: any) => {
        const primary = Number(row.package_value) || 0;
        const addons = Array.isArray(row.addons) ? row.addons.map((a: any) => Number(a.amount)).filter((amt: number) => amt > 0) : [];
        
        let display = '';
        if (primary > 0) display += `${primary}`;
        else if (row.spackage && !row.package_value) return row.spackage;
        
        if (addons.length > 0) {
            display += (display ? ' + ' : '') + addons.map((amt: number) => `${amt}`).join(' + ');
        }
        
        return display || '-';
      },
      sortable: true,
      minWidth: '150px'
    },
    {
      name: "Status",
      selector: (row: any) => row.upgrade_status || row.status,
      sortable: true,
      cell: (row: any) => {
        const status = row.upgrade_status || row.status;
        return (
          <div
            style={{
              color: status === 'Active' || status === 'active' ? 'green' : 'red',
              fontWeight: 'bold',
            }}
          >
            {(status || "").charAt(0).toUpperCase() + (status || "").slice(1)}
          </div>
        );
      },
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Button
          onClick={() => handleToggleStatus(row.Member_id, row.upgrade_status || row.status)}
          disabled={isUpdating}
          variant="contained"
          sx={{
            backgroundColor: (row.upgrade_status === 'Active' || row.status === 'active') ? '#fa5252' : '#51cf66',
            "&:hover": { backgroundColor: (row.upgrade_status === 'Active' || row.status === 'active') ? '#e03131' : '#40c057' },
            color: "#fff",
            padding: "2px 10px",
            minWidth: "100px",
            textTransform: "capitalize"
          }}
        >
          {(row.upgrade_status === 'Active' || row.status === 'active') ? 'Inactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

export const getPendingMembersColumns = (
  handleActivateClick: (member: any) => void,
  isActivating: boolean
) => [
    {
      name: "SNo",
      selector: (row: any) => row.sNo,
      sortable: true,
      width: "70px",
    },
    {
      name: "Vendor Name (ID)",
      selector: (row: any) => `${row.Name ?? "-"} (${row.Member_id})`,
      sortable: true,
    },
    {
      name: "Level",
      selector: (row: any) => row.level ?? 0,
      sortable: true,
      width: "90px",
      center: true,
      cell: (row: any) => (
        <span
          style={{
            backgroundColor: "#ede9fe",
            color: "#6d28d9",
            padding: "3px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {row.level !== undefined && row.level !== null ? row.level : 0}
        </span>
      ),
    },
    {
      name: "Package Amount",
      selector: (row: any) => {
        const pkg = row.package_value ?? row.spackage;
        return pkg;
      },
      sortable: true,
      cell: (row: any) => {
        const amt = row.package_value ?? row.spackage;
        if (!amt) return '-';
        return !isNaN(Number(amt)) ? `${Number(amt).toFixed(2)}` : amt;
      },
    },
    {
      name: "Approved On",
      selector: (row: any) => getFormattedDate(row.Date_of_joining),
      sortable: true,
    },
    {
      name: "Sponsor",
      selector: (row: any) => row.Sponsor_name ?? "-",
      sortable: true,
    },
    {
      name: "MobileNo",
      selector: (row: any) => row.mobileno,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      sortable: true,
      cell: (row: any) => (
        <div
          style={{
            color:
              row.status.toLowerCase() === "active"
                ? "green"
                : row.status.toLowerCase() === "pending"
                  ? "#FFC000"
                  : "red",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </div>
      ),
    },
    {
      name: "Action",
      omit: false,
      cell: (row: any) =>
        row.status.toLowerCase() === "inactive" ? (
          <div style={{ color: "red", fontWeight: 500 }}>
            Cannot Activate
          </div>
        ) : row.status.toLowerCase() === "active" ? (
          <div style={{ color: "green", fontWeight: 500 }}>Activated</div>
        ) : (
          <Button
            onClick={() => handleActivateClick(row)}
            disabled={isActivating}
            variant="contained"
            sx={{
              backgroundColor: "#51cf66",
              "&:hover": { backgroundColor: "#3bcf57" },
              color: "#000",
              padding: "2px 10px",
              cursor: "pointer",
              textTransform: "capitalize"
            }}
          >
            Activate
          </Button>
        ),
    },
  ];


export const getSupportTicketColumns = (handleOpenDialog: any) => [
  {
    name: 'Vendor',
    selector: (row: any) => row.reference_id,
    sortable: true,
  },
  {
    name: 'Ticket Date',
    selector: (row: any) => getFormattedDate(row.ticket_date),
    sortable: true,
  },
  {
    name: 'Ticket No',
    selector: (row: any) => row.ticket_no,
    sortable: true,
  },

  {
    name: 'Type of ticket',
    selector: (row: any) => row.type_of_ticket,
    sortable: true,
  },
  {
    name: 'Subject',
    selector: (row: any) => row.SUBJECT,
    sortable: true,
  },
  {
    name: 'Status',
    selector: (row: any) => row.ticket_status,
    cell: (row: any) => {
      const status = row.ticket_status?.toLowerCase();
      return (
        <span
          style={{
            color: status === 'pending' ? '#CC5500' : '#008000',
            padding: '0.5rem',
            borderRadius: '4px',
          }}
        >
          {row.ticket_status?.charAt(0).toUpperCase() + row.ticket_status?.slice(1)}
        </span>
      );
    },
    sortable: true,
  },
  {
    name: 'Action',
    cell: (row: any) => (
      <Button
        variant="contained"
        onClick={() => handleOpenDialog(row)}
        sx={{
          backgroundColor: '#0a2558',
          '&:hover': { backgroundColor: '#581c87' }
        }}
      >
        Reply
      </Button>
    ),
  },
];

export const getusedandUnUsedColumns = () => [
  {
    name: "Vendor Code",
    selector: (row: any) => row.memberCode,
    sortable: true,
  },
  {
    name: "Used Quantity",
    selector: (row: any) => row.usedQuantity,
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status,
    sortable: true,
  },
];

export const getAdminPackageHistoryColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.date),
    sortable: true,
  },
  {
    name: "Vendor",
    selector: (row: any) => row.memberCode,
  },
  {
    name: "Quantity",
    selector: (row: any) => row.totalQuantity,
  }

]

export const getMailBoxColumns = (handleOpenDialog: any) => [
  {
    name: 'Ticket Date',
    selector: (row: any) => getFormattedDate(row.ticket_date),
    sortable: true,
  },
  {
    name: 'Ticket No',
    selector: (row: any) => row.ticket_no,
    sortable: true,
    cell: (row: any) => (
      <div
        style={{
          backgroundColor: '#5bc0de',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        {row.ticket_no}
      </div>
    ),
  },
  {
    name: 'Type of ticket',
    selector: (row: any) => row.type_of_ticket,
    sortable: true,
  },
  {
    name: 'Subject',
    selector: (row: any) => row.SUBJECT,
    sortable: true,
  },
  {
    name: 'Status',
    selector: (row: any) => row.ticket_status,
    sortable: true,
    cell: (row: any) => (
      <div
        style={{
          color: row.ticket_status?.toLowerCase() === 'pending' ? '#fb741a' : '#569f35',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        {row.ticket_status?.charAt(0).toUpperCase() + row.ticket_status?.slice(1)}
      </div>
    ),
  },
  {
    name: 'Actions',
    cell: (row: any) => (
      <IconButton
        onClick={() => handleOpenDialog(row)}
        size="medium"
        sx={{
          color: '#0a2558',
          '&:hover': {
            backgroundColor: 'rgba(4, 17, 47, 0.04)'
          }
        }}
      >
        <VisibilityIcon color='primary' fontSize="medium" />
      </IconButton>
    ),
    sortable: false,
  },
];

export const getAdminPageTransactionColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.transaction_date),
    sortable: true,
  },
  {
    name: "Vendor",
    selector: (row: any) => row.member_id,
    sortable: true,
  },
  {
    name: "Description",
    selector: (row: any) => row.description,
    sortable: true,
  },
  {
    name: "Type",
    selector: (row: any) => row.transaction_type,
    sortable: true,
  },
  {
    name: "EW Credit",
    selector: (row: any) => row.ew_credit,
    sortable: true,
  },
  {
    name: "EW Debit",
    selector: (row: any) => row.ew_debit,
    sortable: true,
  },
];

export const getSMSTransactionColumns = () => [
  {
    name: "Date",
    selector: (row: any) => row.date,
    sortable: true,
  },
  {
    name: "ID",
    selector: (row: any) => row.id,
    sortable: true,
  },
  {
    name: "Vendor",
    selector: (row: any) => row.member,
    sortable: true,
  },
  {
    name: "Message Type",
    selector: (row: any) => row.messageType,
    sortable: true,
  },
  {
    name: "Sent To",
    selector: (row: any) => row.sentTo,
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status,
    sortable: true,
  },
];

export const getNewsColumns = () => [
  {
    name: "From Date",
    selector: (row: any) => getFormattedDate(row.from_date),
    sortable: true,
  },
  {
    name: "To Date",
    selector: (row: any) => getFormattedDate(row.to_date),
    sortable: true,
  },
  {
    name: "Content",
    selector: (row: any) => row.news_details,
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status,
    cell: (row: any) => (
      <span
        style={{
          color: row.status === "active" ? "#569f35" : "transparent",
          padding: "0.5rem",
          borderRadius: "4px",
        }}
      >
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </span>
    ),
    sortable: true,
  },
];

export const getHolidaysColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.holiday_date),
    sortable: true,
  },
  {
    name: "Description",
    selector: (row: any) => row.holiday_desc,
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status,
    cell: (row: any) => (
      <span
        style={{
          color: row.status === "active" ? "#569f35" : "transparent",
          padding: "0.5rem",
          borderRadius: "4px",
        }}
      >
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </span>
    ),
    sortable: true,
  },
];

export const getRequestColumns = (approveTrasaction: (id: any) => void) => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.transaction_date) || "-",
    sortable: true,
  },
  {
    name: "Vendor",
    selector: (row: any) => row.member_id || "-",
    sortable: true,
  },
  {
    name: "Mobile No.",
    selector: (row: any) => row.memberDetails?.mobileno || "-",
    sortable: true,
  },
  {
    name: "Account No.",
    selector: (row: any) => row.memberDetails?.account_number || "-",
    sortable: true,
  },
  {
    name: "IFSC Code",
    selector: (row: any) => row.memberDetails?.ifsc_code || "-",
    sortable: true,
  },
  {
    name: "Paid Amount",
    selector: (row: any) => row.ew_debit || "-",
    sortable: true,
  },
  {
    name: "Deducted",
    selector: (row: any) => row.deduction || "-",
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "-",
    sortable: true,
  },
  {
    name: "Action",
    selector: (_row: any) => {
      return (
        <>
          <Button variant="contained" onClick={() => approveTrasaction(_row.transaction_id)}>Approve</Button>
        </>
      )
    },
    sortable: true,
  },
]

export const getProccessedColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.transaction_date) || "-",
    sortable: true,
  },
  {
    name: "Vendor",
    selector: (row: any) => row.member_id || "-",
    sortable: true,
  },
  {
    name: "Mobile No.",
    selector: (row: any) => row.memberDetails?.mobileno || "-",
    sortable: true,
  },
  {
    name: "Account No.",
    selector: (row: any) => row.memberDetails?.account_number || "-",
    sortable: true,
  },
  {
    name: "IFSC Code",
    selector: (row: any) => row.memberDetails?.ifsc_code || "-",
    sortable: true,
  },
  {
    name: "Paid Amount",
    selector: (row: any) => row.net_amount || "-",
    sortable: true,
  },
  {
    name: "Deducted",
    selector: (row: any) => row.deduction || "-",
    sortable: true,
  },

]

export const getPayblesColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.date),
    sortable: true,
  },
  {
    name: "Vendor",
    selector: (row: any) => row.Member,
    sortable: true,
  },
  {
    name: "Mobile No.",
    selector: (row: any) => row.mobileno,
    sortable: true,
  },
  {
    name: "Account No.",
    selector: (row: any) => row.account,
    sortable: true,
  },
  {
    name: "IFSC Code",
    selector: (row: any) => row.ifsc,
    sortable: true,
  },
  {
    name: "Payble Amount",
    selector: (row: any) => row.amount,
    sortable: true,
  },
  {
    name: "Action",
    selector: (row: any) => row.action,
    sortable: true,
  },

]

export const getCashBackColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.date),
    sortable: true,
  },
  {
    name: "Vendor",
    selector: (row: any) => row.Member,
    sortable: true,
  },
  {
    name: "Amount",
    selector: (row: any) => row.amount,
    sortable: true,
  },
  {
    name: "Action",
    selector: (row: any) => row.action,
    sortable: true,
  },
]

export const getMultiLevelColumns = () => [
  {
    name: "Level",
    selector: (row: any) => `Level ${row.level}`,
    sortable: true,
  },
  {
    name: "Total ",
    selector: (row: any) => row.total,
    sortable: true,
  },
  {
    name: "Active ",
    selector: (row: any) => row.active,
    sortable: true,
    cell: (row: any) => (
      <div
        style={{
          padding: '5px 10px',
          borderRadius: '4px',
        }}
      >
        {row.active}
      </div>
    ),
  },
  {
    name: "Pending ",
    selector: (row: any) => row.pending,
    sortable: true,
    cell: (row: any) => (
      <div
        style={{
          padding: '5px 10px',
          borderRadius: '4px',
        }}
      >
        {row.pending}
      </div>
    ),
  },
];


// ==========================================
// ADMIN COMMISSION / INCOME DETAILED COLUMNS
// ==========================================

// ==========================================
// ADMIN COMMISSION / INCOME DETAILED COLUMNS
// ==========================================

export const getAdminReferralIncomeColumns = () => [
  {
    name: "S No",
    cell: (_: any, index: number) => index + 1,
    width: "70px",
  },
  {
    name: "Sponsor Name",
    selector: (row: any) => row.Name || row.name || "-",
    sortable: true,
    minWidth: "150px",
    cell: (row: any) => (
      <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "13px" }}>
        {row.Name || row.name || "-"}
      </span>
    ),
  },
  {
    name: "Sponsor ID",
    selector: (row: any) => row.member_id || "-",
    sortable: true,
    minWidth: "130px",
    cell: (row: any) => (
      <span style={{ fontWeight: 600, color: "#002970", fontSize: "12px", fontFamily: "monospace" }}>
        {row.member_id || "-"}
      </span>
    ),
  },
  {
    name: "Vendor Name",
    selector: (row: any) => row.related_member_name || "-",
    sortable: true,
    minWidth: "150px",
    cell: (row: any) => (
      <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "13px" }}>
        {row.related_member_name || "-"}
      </span>
    ),
  },
  {
    name: "Vendor ID",
    selector: (row: any) => row.related_member_id || "-",
    sortable: true,
    minWidth: "130px",
    cell: (row: any) => (
      <span style={{ fontWeight: 600, color: "#475569", fontSize: "12px", fontFamily: "monospace" }}>
        {row.related_member_id || "-"}
      </span>
    ),
  },
  {
    name: "Commission (₹)",
    selector: (row: any) => parseFloat(row.ew_credit || row.amount || 0),
    sortable: true,
    width: "140px",
    cell: (row: any) => {
      const amt = parseFloat(row.ew_credit || row.amount || 0);
      return (
        <span style={{ color: "#16a34a", fontWeight: 800, fontSize: "13px" }}>
          ₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    },
  },
  {
    name: "Description",
    selector: (row: any) => row.description || "-",
    sortable: true,
    minWidth: "220px",
    wrap: true,
    cell: (row: any) => (
      <span style={{ fontSize: "12px", color: "#475569" }}>
        {row.description || "-"}
      </span>
    ),
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "Completed",
    sortable: true,
    width: "115px",
    center: true,
    cell: (row: any) => {
      const status = row.status || "Completed";
      const isOk = status.toLowerCase() === "completed" || status.toLowerCase() === "approved";
      return (
        <span
          style={{
            backgroundColor: isOk ? "#dcfce7" : "#fee2e2",
            color: isOk ? "#15803d" : "#b91c1c",
            padding: "3px 8px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          {status}
        </span>
      );
    },
  },
];

export const getAdminLevelBonusColumns = () => [
  {
    name: "S No",
    cell: (_: any, index: number) => index + 1,
    width: "70px",
  },
  {
    name: "Sponsor / Upline Name",
    selector: (row: any) => row.Name || row.name || "-",
    sortable: true,
    minWidth: "160px",
    cell: (row: any) => (
      <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "13px" }}>
        {row.Name || row.name || "-"}
      </span>
    ),
  },
  {
    name: "Sponsor / Upline ID",
    selector: (row: any) => row.member_id || "-",
    sortable: true,
    minWidth: "140px",
    cell: (row: any) => (
      <span style={{ fontWeight: 600, color: "#002970", fontSize: "12px", fontFamily: "monospace" }}>
        {row.member_id || "-"}
      </span>
    ),
  },
  {
    name: "Vendor Name",
    selector: (row: any) => row.related_member_name || "-",
    sortable: true,
    minWidth: "150px",
    cell: (row: any) => (
      <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "13px" }}>
        {row.related_member_name || "-"}
      </span>
    ),
  },
  {
    name: "Vendor ID",
    selector: (row: any) => row.related_member_id || "-",
    sortable: true,
    minWidth: "130px",
    cell: (row: any) => (
      <span style={{ fontWeight: 600, color: "#475569", fontSize: "12px", fontFamily: "monospace" }}>
        {row.related_member_id || "-"}
      </span>
    ),
  },
  {
    name: "Bonus (₹)",
    selector: (row: any) => parseFloat(row.ew_credit || row.amount || 0),
    sortable: true,
    width: "130px",
    cell: (row: any) => {
      const amt = parseFloat(row.ew_credit || row.amount || 0);
      return (
        <span style={{ color: "#16a34a", fontWeight: 800, fontSize: "13px" }}>
          ₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    },
  },
  {
    name: "Description",
    selector: (row: any) => row.description || "-",
    sortable: true,
    minWidth: "220px",
    wrap: true,
    cell: (row: any) => (
      <span style={{ fontSize: "12px", color: "#475569" }}>
        {row.description || "-"}
      </span>
    ),
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "Completed",
    sortable: true,
    width: "115px",
    center: true,
    cell: (row: any) => {
      const status = row.status || "Completed";
      const isOk = status.toLowerCase() === "completed" || status.toLowerCase() === "approved";
      return (
        <span
          style={{
            backgroundColor: isOk ? "#dcfce7" : "#fee2e2",
            color: isOk ? "#15803d" : "#b91c1c",
            padding: "3px 8px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          {status}
        </span>
      );
    },
  },
];

export const getAdminDailyIncentiveColumns = () => [
  {
    name: "S No",
    cell: (_: any, index: number) => index + 1,
    width: "70px",
  },
  {
    name: "Vendor Name",
    selector: (row: any) => row.Name || row.name || "-",
    sortable: true,
    minWidth: "160px",
    cell: (row: any) => (
      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "13px" }}>
        {row.Name || row.name || "-"}
      </span>
    ),
  },
  {
    name: "Vendor ID",
    selector: (row: any) => row.member_id || "-",
    sortable: true,
    minWidth: "130px",
    cell: (row: any) => (
      <span style={{ fontWeight: 600, color: "#002970", fontSize: "12px", fontFamily: "monospace" }}>
        {row.member_id || "-"}
      </span>
    ),
  },
  {
    name: "Mobile No",
    selector: (row: any) => row.mobileno || "-",
    sortable: true,
    width: "130px",
    cell: (row: any) => (
      <span style={{ fontSize: "12px", color: "#334155" }}>
        {row.mobileno || "-"}
      </span>
    ),
  },
  {
    name: "Incentive (₹)",
    selector: (row: any) => parseFloat(row.ew_credit || row.amount || 0),
    sortable: true,
    width: "135px",
    cell: (row: any) => {
      const amt = parseFloat(row.ew_credit || row.amount || 0);
      return (
        <span style={{ color: "#16a34a", fontWeight: 800, fontSize: "13px" }}>
          ₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    },
  },
  {
    name: "Description",
    selector: (row: any) => row.description || "-",
    sortable: true,
    minWidth: "220px",
    wrap: true,
    cell: (row: any) => (
      <span style={{ fontSize: "12px", color: "#475569" }}>
        {row.description || "-"}
      </span>
    ),
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "Completed",
    sortable: true,
    width: "115px",
    center: true,
    cell: (row: any) => {
      const status = row.status || "Completed";
      const isOk = status.toLowerCase() === "completed" || status.toLowerCase() === "approved";
      return (
        <span
          style={{
            backgroundColor: isOk ? "#dcfce7" : "#fee2e2",
            color: isOk ? "#15803d" : "#b91c1c",
            padding: "3px 8px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          {status}
        </span>
      );
    },
  },
];

// Aliases for backwards compatibility
export const getAdminDailyBenifitsColumns = getAdminDailyIncentiveColumns;
export const getAdminLevelBenifitsColumns = getAdminLevelBonusColumns;



const TABLE_ROW_CUSTOM_STYLE = {
  style: {
    fontFamily: "Bogle-Regular",
    "&:last-child": {
      borderBottom: "1px solid rgba(0,0,0,.12)",
    },
  },
};
export const DASHBOARD_CUTSOM_STYLE = {
  headCells: {
    style: {
      fontSize: "14px",
      fontWeight: 800,
      backgroundColor: "#F1F5F7",
      color: "#1F333B",
      borderBottom: "2px solid #FE8001",
    },
  },
  rows: {
    style: {
      ...TABLE_ROW_CUSTOM_STYLE,
      fontSize: "13px",
      color: "#1F333B",
      '&:hover': {
        backgroundColor: 'rgba(254, 128, 1, 0.06)',
      },
    },
    highlightOnHoverStyle: {
      backgroundColor: 'rgba(254, 128, 1, 0.06)',
      borderBottomColor: '#FE8001',
      outline: '1px solid #FE8001',
    },
  },
  pagination: {
    style: {
      color: '#1F333B',
      borderTop: '1px solid #E2E8F0',
      backgroundColor: '#ffffff',
    },
    pageButtonsStyle: {
      fill: '#FE8001',
      '&:disabled': {
        fill: '#889EA6',
      },
      '&:hover:not(:disabled)': {
        backgroundColor: 'rgba(254, 128, 1, 0.08)',
      },
    },
  },
};


export const getPendingLoansColumns = (processLoan: (memberId: string, action: 'approve' | 'reject') => void) => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.transaction_date) || "-",
    sortable: true,
  },
  {
    name: "Vendor ID",
    selector: (row: any) => row.member_id || "-",
    sortable: true,
  },
  {
    name: "Vendor Name",
    selector: (row: any) => row.Name || "-",
    sortable: true,
  },
  {
    name: "Mobile No.",
    selector: (row: any) => row.mobileno || "-",
    sortable: true,
  },
  {
    name: "Loan Amount",
    selector: (row: any) => row.ew_credit || "-",
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "-",
    sortable: true,
    cell: (row: any) => (
      <span className={`status-badge ${row.status?.toLowerCase()}`}>
        {row.status}
      </span>
    ),
  },
  {
    name: "Action",
    cell: (row: any) => (
      <div className="action-buttons">
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => processLoan(row.member_id, 'approve')}
          style={{ marginRight: '8px' }}
        >
          Approve
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => processLoan(row.member_id, 'reject')}
        >
          Reject
        </Button>
      </div>
    ),
    sortable: false,
  },
];

// Columns for Withdraw Pending table (Admin)
// Hard-coded columns and styling to match dashboard tables
export const getWithdrawPendingColumns = (onRepay: (transaction: any) => void) => [
  {
    name: 'Date',
    selector: (row: any) => getFormattedDate(row.transaction_date) || '-',
    sortable: true,
  },
  {
    name: 'Vendor',
    selector: (row: any) => row.member_id || '-',
    sortable: true,
  },
  {
    name: 'Mobile No.',
    selector: (row: any) => row.memberDetails?.mobileno || '-',
    sortable: true,
  },
  {
    name: 'Account No.',
    selector: (row: any) => row.memberDetails?.account_number || '-',
    sortable: true,
  },
  {
    name: 'IFSC',
    selector: (row: any) => row.memberDetails?.ifsc_code || '-',
    sortable: true,
  },
  {
    name: 'Paid Amount',
    selector: (row: any) => row.ew_debit || '-',
    sortable: true,
    cell: (row: any) => row.ew_debit ? `${Number(row.net_amount).toFixed(2)}` : '-',
  },
  {
    name: 'Deducted',
    selector: (row: any) => row.deduction || 0,
    sortable: true,
    cell: (row: any) => `${Number(row.deduction || 0).toFixed(2)}`,
  },
  {
    name: 'Status',
    selector: (row: any) => row.status || '-',
    sortable: true,
  },
  {
    name: 'Action',
    cell: (row: any) => (
      <div>
        <Button
          variant="contained"
          color="primary"
          size="small"
          sx={{ textTransform: 'capitalize' }}
          onClick={() => onRepay(row)}
        >
          Pay Now
        </Button>
      </div>
    ),
    sortable: false,
  },
  //  {
  //   name: 'Action',
  //   cell: (row: any) => (
  //     <div>
  //       <Button
  //         variant="contained"
  //         color="primary"
  //         size="small"
  //         sx={{ textTransform: 'capitalize' }}
  //         onClick={() => onRepay(row)}
  //       >
  //         pay online
  //       </Button>
  //     </div>
  //   ),
  //   sortable: false,
  // },
];

export const getProcessedLoansColumns = () => [
  {
    name: "Date",
    selector: (row: any) => getFormattedDate(row.transaction_date) || "-",
    sortable: true,
  },
  {
    name: "Vendor ID",
    selector: (row: any) => row.member_id || "-",
    sortable: true,
  },
  {
    name: "Vendor Name",
    selector: (row: any) => row.Name || "-",
    sortable: true,
  },
  {
    name: "Mobile No.",
    selector: (row: any) => row.mobileno || "-",
    sortable: true,
  },
  {
    name: "Loan Amount",
    selector: (row: any) => `${parseInt(row.ew_credit || 0).toFixed(2)}` || "-",
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "-",
    sortable: true,
    cell: (row: any) => (
      <span className={`status-badge ${row.status?.toLowerCase()}`}>
        {row.status}
      </span>
    ),
  },
];

export const getLoansListColumns = (onRepayClick: (row: any) => void) => [
  {
    name: "Date",
    selector: (row: any) => {
      if (!row.transaction_date) return "-";
      const date = new Date(row.transaction_date);
      return date.toLocaleDateString("en-US");
    },
    sortable: true,
  },
  {
    name: "Vendor ID",
    selector: (row: any) => row.member_id || "-",
    sortable: true,
  },
  {
    name: "Name",
    selector: (row: any) => row.Name || "-",
    sortable: true,
  },
  {
    name: "Mobile No.",
    selector: (row: any) => row.mobileno || "-",
    sortable: true,
  },
  {
    name: "Loan Amount",
    selector: (row: any) =>
      `${(row.ew_credit || 5000).toLocaleString("en-US")}`,
    sortable: true,
  },
  {
    name: "Due Amount",
    selector: (row: any) =>
      `${row.net_amount?.toLocaleString("en-US")}` || "-",
    sortable: true,
  },
  {
    name: "Action",
    cell: (row: any) => (
      <button
        onClick={() => onRepayClick(row)}
        style={{
          background: "#0a2558",
          color: "white",
          padding: "5px 12px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Repay
      </button>
    ),
  },
];

export const getUpgradeWalletColumns = () => [
  {
    name: "Date",
    selector: (row: any) => {
      if (!row.transaction_date && !row.createdAt) return "-";
      const date = new Date(row.transaction_date || row.createdAt);
      return date.toLocaleDateString();
    },
    sortable: true,
  },
  {
    name: "Transaction ID",
    selector: (row: any) => row.transaction_id || "-",
    sortable: true,
  },
  {
    name: "Type",
    selector: (row: any) => row.transaction_type || "-",
    sortable: true,
  },
  {
    name: "Amount",
    selector: (row: any) => {
      const isDebit = parseFloat(row.uw_debit || 0) > 0;
      const amt = isDebit ? row.uw_debit : row.uw_credit;
      const sign = isDebit ? "-" : "+";
      return amt && parseFloat(amt) > 0 ? `${sign}${parseFloat(amt).toFixed(2)}` : "-";
    },
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "Completed",
    sortable: true,
  },
];

export const getTopUpWalletColumns = () => [
  {
    name: "Date",
    selector: (row: any) => {
      if (!row.transaction_date && !row.createdAt) return "-";
      const date = new Date(row.transaction_date || row.createdAt);
      return date.toLocaleDateString();
    },
    sortable: true,
  },
  {
    name: "Transaction ID",
    selector: (row: any) => row.tx_no || row.transaction_id || "-",
    sortable: true,
  },
  {
    name: "Amount",
    selector: (row: any) => {
      const amt = row.amount || row.requested_amount || row.ew_credit;
      return amt && parseFloat(amt) > 0 ? `${parseFloat(amt).toFixed(2)}` : "-";
    },
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "Completed",
    sortable: true,
  },
];

export const getFixedDepositWalletColumns = () => [
  {
    name: "Date",
    selector: (row: any) => {
      if (!row.transaction_date && !row.createdAt) return "-";
      const date = new Date(row.transaction_date || row.createdAt);
      return date.toLocaleDateString();
    },
    sortable: true,
  },
  {
    name: "Transaction ID",
    selector: (row: any) => row.tx_no || row.transaction_id || "-",
    sortable: true,
  },
  {
    name: "Amount",
    selector: (row: any) => {
      const amt = row.fd_credit || row.amount;
      return amt && parseFloat(amt) > 0 ? `${parseFloat(amt).toFixed(2)}` : "-";
    },
    sortable: true,
  },
  {
    name: "Description",
    selector: (row: any) => row.description || "-",
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "Completed",
    sortable: true,
  },
];

export const getPurchaseWalletColumns = () => [
  {
    name: "Date",
    selector: (row: any) => {
      if (!row.transaction_date && !row.createdAt) return "-";
      const date = new Date(row.transaction_date || row.createdAt);
      return date.toLocaleDateString();
    },
    sortable: true,
  },
  {
    name: "Transaction ID",
    selector: (row: any) => row.tx_no || row.transaction_id || "-",
    sortable: true,
  },
  {
    name: "Amount",
    selector: (row: any) => {
      const amt = row.pw_credit || row.amount;
      return amt && parseFloat(amt) > 0 ? `${parseFloat(amt).toFixed(2)}` : "-";
    },
    sortable: true,
  },
  {
    name: "Description",
    selector: (row: any) => row.description || "-",
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "Completed",
    sortable: true,
  },
];

export const getVendorWalletColumns = () => [
  {
    name: "Date",
    selector: (row: any) => {
      if (!row.transaction_date && !row.createdAt) return "-";
      const date = new Date(row.transaction_date || row.createdAt);
      return date.toLocaleDateString();
    },
    sortable: true,
    cell: (row: any) => {
      if (!row.transaction_date && !row.createdAt) return <span style={{ color: '#94A3B8' }}>-</span>;
      const date = new Date(row.transaction_date || row.createdAt);
      return (
        <span style={{ fontSize: '0.83rem', color: '#64748B', fontWeight: 500 }}>
          {date.toLocaleDateString()}
        </span>
      );
    }
  },
  {
    name: "Transaction ID",
    selector: (row: any) => row.tx_no || row.transaction_id || "-",
    sortable: true,
    cell: (row: any) => (
      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748B' }}>
        {row.tx_no || row.transaction_id || "-"}
      </span>
    )
  },
  {
    name: "Type",
    selector: (row: any) => row.transaction_type || "Vendor Withdrawal",
    sortable: true,
    cell: (row: any) => (
      <span style={{ fontSize: '0.83rem', color: '#FE8001', fontWeight: 800 }}>
        {row.transaction_type || "Vendor Withdrawal"}
      </span>
    )
  },
  {
    name: "Amount",
    selector: (row: any) => {
      const amt = row.vw_debit || row.gross_amount || row.amount || row.vw_credit;
      return amt ? parseFloat(amt) : 0;
    },
    sortable: true,
    cell: (row: any) => {
      const amt = row.vw_debit || row.gross_amount || row.amount || row.vw_credit;
      const isDebit = parseFloat(row.vw_debit || 0) > 0 || (row.transaction_type && row.transaction_type.toLowerCase().includes("withdrawal"));
      if (!amt || parseFloat(amt) === 0) return <span style={{ color: '#94A3B8' }}>-</span>;
      return (
        <span style={{
          fontWeight: 800,
          color: isDebit ? '#DC2626' : '#16A34A',
          fontSize: '0.85rem'
        }}>
          {isDebit ? "- " : "+ "}₹{parseFloat(amt).toFixed(2)}
        </span>
      );
    }
  },
  {
    name: "Description",
    selector: (row: any) => row.description || "-",
    sortable: true,
    wrap: true,
    grow: 1.5,
    cell: (row: any) => (
      <span style={{ fontSize: '0.84rem', color: '#1F333B', fontWeight: 500 }}>
        {row.description || "-"}
      </span>
    )
  },
  {
    name: "Status",
    selector: (row: any) => row.status || "Pending",
    sortable: true,
    cell: (row: any) => {
      const statusStr = String(row.status || 'Pending');
      const isApproved = statusStr.toLowerCase() === 'approved' || statusStr.toLowerCase() === 'completed' || statusStr.toLowerCase() === 'success';
      const isRejected = statusStr.toLowerCase() === 'rejected';
      return (
        <span style={{
          padding: '3px 9px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 700,
          backgroundColor: isApproved ? '#DCFCE7' : isRejected ? '#FEE2E2' : '#FEF3C7',
          color: isApproved ? '#15803D' : isRejected ? '#DC2626' : '#B45309'
        }}>
          {statusStr}
        </span>
      );
    }
  },
];

