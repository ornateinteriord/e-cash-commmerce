import { SideBarMenuItemType } from '../../store/store';
import { DashboardIcon, AccountCircleIcon, CheckCircleIcon, GroupIcon, MonetizationOnIcon, ShowChartIcon, CreditCardIcon, MailOutlineIcon, PersonIcon, VerifiedUserIcon, LockIcon, PeopleIcon, AccountTreeIcon, PersonAddIcon, TrendingUpIcon, PaymentsIcon, SupportIcon, AnnouncementIcon, EventIcon, SmsIcon,  } from '../Icons';
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import SendIcon from "@mui/icons-material/Send";
import { LucideIcons, MuiIcons } from '../Icons';

export const UserSideBarMenuItems: SideBarMenuItemType[] = [
  {
    name: "Dashboard",
    icon: <DashboardIcon />,
    path: "/user/dashboard",
    isExpandable: false,
  },
  /* {
    name: "Load Fund",
    icon: <PaymentsIcon />,
    path: "/user/load-fund",
    isExpandable: false,
  }, */
  {
    name: "Invest Amount",
    icon: <PaymentsIcon />,
    path: "/user/new-subscription",
    isExpandable: false,
  },
  {
    name: "My Investments",
    icon: <ReceiptLongIcon />,
    path: "/user/my-subscriptions",
    isExpandable: false,
  },
  {
    name: "Profile & Security",
    icon: <AccountCircleIcon />,
    isExpandable: true,
    subItems: [
      { name: "Profile", path: "/user/account/profile", icon: <PersonIcon /> },
      { name: "KYC Verification", path: "/user/account/kyc", icon: <VerifiedUserIcon /> },
      {
        name: "Security Password",
        path: "/user/account/change-password",
        icon: <LockIcon />,
      },
    ],
  },
  {
    name: "Brokerage",
    icon: <GroupIcon />,
    isExpandable: true,
    subItems: [
      { name: "My Direct", path: "/user/team/direct", icon: <PeopleIcon /> },
      { name: "My Vendor", path: "/user/team", icon: <GroupIcon /> },
      { name: "Network Tree", path: "/user/team/tree", icon: <AccountTreeIcon /> },
      {
        name: "Register Vendor",
        path: "/user/team/new-register",
        icon: <PersonAddIcon />,
      },
    ],
  },
  {
    name: "Commission",
    icon: <MonetizationOnIcon />,
    isExpandable: true,
    subItems: [
      {
        name: "Referral Commission",
        path: "/user/earnings/referral-bonus",
        icon: <PaymentsIcon />,
      },
      {
        name: "Level Bonus",
        path: "/user/earnings/level-benefits",
        icon: <TrendingUpIcon />,
      },
      {
        name: "Daily Incentive",
        path: "/user/earnings/single-level-income-history",
        icon: <PaymentsIcon />,
      },
      {
        name: "Level Daily ROI",
        path: "/user/earnings/level-daily-roi",
        icon: <TrendingUpIcon />,
      },
    ],
  },
  {
    name: "Transactions",
    icon: <MonetizationOnIcon />,
    path: "/user/transactions",
    isExpandable: false,
  },
  /* Sub-menus collapsed into single Transactions link above
  {
    name: "Transactions",
    icon: <ShowChartIcon />,
    isExpandable: true,
    subItems: [
      { name: "RD Deposit", path: "/user/transactions", icon: <CreditCardIcon /> },
      { name: "Loan", path: "/user/loantransactions", icon: <AccountBalance /> },
    ],
  },
  */
  {
    name: "Brokerage Earnings",
    icon: <CreditCardIcon />,
    path: "/user/wallet",
    isExpandable: false,
  },
  {
    name: "Property Fund",
    icon: <CreditCardIcon />,
    path: "/user/upgrade-wallet",
    isExpandable: false,
  },
  {
    name: "Scan & Pay",
    icon: <QrCode2Icon />,
    path: "/user/my-qr",
    isExpandable: false,
  },
  {
    name: "P2P Transfer",
    icon: <SendIcon />,
    path: "/user/p2p-transfer",
    isExpandable: false,
  },
  {
    name: "Add-On Investments",
    icon: <PaymentsIcon />,
    path: "/user/addon-packages",
    isExpandable: false,
  },
  {
    name: "Mail Box",
    icon: <MailOutlineIcon />,
    path: "/user/mailbox",
    isExpandable: false,
  },
  {
    name: "Support",
    icon: <SupportIcon />,
    path: "/user/support-chat",
    isExpandable: false,
  },
  {
    name: "Chat",
    icon: <MailOutlineIcon />,
    path: "/user/chat",
    isExpandable: false,
  },
];



export const AdminSideBarMenuItems: SideBarMenuItemType[] = [
  {
    name: "Dashboard",
    icon: <DashboardIcon />,
    path: "/admin/dashboard",
    isExpandable: false,
  },
  {
    name: "Escrow Deposits",
    icon: <PaymentsIcon />,
    isExpandable: true,
    subItems: [
      {
        name: "Deposit Settings",
        path: "/admin/load-fund",
        icon: <PaymentsIcon />,
      },
      {
        name: "Deposit Requests",
        path: "/admin/addon-approvals",
        icon: <ReceiptLongIcon />,
      },
    ],
  },
  {
    name: "Vendors",
    icon: <GroupIcon />,
    isExpandable: true,
    subItems: [
      { name: "All Vendors", path: "/admin/members", icon: <PeopleIcon /> },
      {
        name: "Pending Vendors",
        path: "/admin/members/pending",
        icon: <PersonAddIcon />,
      },
      {
        name: "Active Vendors",
        path: "/admin/members/active",
        icon: <CheckCircleIcon />,
      },
      {
        name: "Inactive Vendors",
        path: "/admin/members/inactive",
        icon: <PersonIcon />,
      },
      {
        name: "KYC Approvals",
        path: "/admin/kyc-approval",
        icon: <VerifiedUserIcon />,
      },
      {
        name: "Permissions",
        path: "/admin/members/permissions",
        icon: <LockIcon />,
      },
    ],
  },
  {
    name: "Commission",
    icon: <MonetizationOnIcon />,
    isExpandable: true,
    subItems: [
      {
        name: "Referral Commission",
        path: "/admin/income/referral-income",
        icon: <PaymentsIcon />,
      },
      {
        name: "Level Bonus",
        path: "/admin/income/level-benefits",
        icon: <TrendingUpIcon />,
      },
      {
        name: "Daily Incentive",
        path: "/admin/income/daily-payouts",
        icon: <PaymentsIcon />,
      },
      {
        name: "Level Daily ROI",
        path: "/admin/income/level-daily-roi",
        icon: <TrendingUpIcon />,
      },
    ],
  },
  {
    name: "Withdrawals",
    icon: <CreditCardIcon />,
    isExpandable: true,
    subItems: [
      {
        name: "Payout History",
        path: "/admin/payout",
        icon: <PaymentsIcon />,
      },
    ],
  },
  {
    name: "Transactions",
    icon: <ShowChartIcon />,
    isExpandable: true,
    subItems: [
      {
        name: "All Transactions",
        path: "/admin/transactions",
        icon: <ShowChartIcon />,
      },
      {
        name: "SMS Transactions",
        path: "/admin/transactions/sms",
        icon: <SmsIcon />,
      },
    ],
  },
  {
    name: "Support Tickets",
    path: "/admin/support-tickets",
    icon: <SupportIcon />,
    isExpandable: false,
  },
  {
    name: "News & Updates",
    path: "/admin/news",
    icon: <AnnouncementIcon />,
    isExpandable: false,
  },
  {
    name: "Holidays",
    path: "/admin/holidays",
    icon: <EventIcon />,
    isExpandable: false,
  },
  {
    name: "Chat",
    path: "/admin/chat",
    icon: <MailOutlineIcon />,
    isExpandable: false,
  },
];

export const Admin01SideBarMenuItems: SideBarMenuItemType[] = [
  {
    name: "Dashboard",
    icon: <DashboardIcon />,
    path: "/admin_01/dashboard",
    isExpandable: false,
  },
  {
    name: "Administration",
    icon: <LucideIcons.Settings />,
    isExpandable: true,
    subItems: [
      { name: "Vendors", path: "/admin_01/members", icon: <PeopleIcon /> },
      // { name: "Agents", path: "/banking/agents", icon: <PersonIcon /> },
      // { name: "Interests", path: "/banking/interestrate", icon: <PercentIcon /> },
    ],
  },
  {
    name: "Commission Payouts",
    icon: <PaymentsIcon />,
    path: "/admin/withdrawal-requests",
    isExpandable: false,
  },
  /* {
    name: "Agent Assignment",
    icon: <LucideIcons.ClipboardCheck />,
    path: "/agentassignemt/agent-assignment",
    isExpandable: false,
  }, */
  /* {
    name: "Banking",
    icon: <LucideIcons.Landmark />,
    isExpandable: true,
    subItems: [
      { name: "Receipts", path: "/admin/banking/receipts", icon: <ReceiptLongIcon /> },
      { name: "Payments", path: "/admin/banking/payments", icon: <PaymentsIcon /> },
      { name: "Cash Transaction", path: "/admin/banking/cash-transaction", icon: <LucideIcons.IndianRupee /> },
    ],
  },
  {
    name: "SB Account",
    icon: <LucideIcons.Wallet />,
    isExpandable: true,
    subItems: [
      { name: "SB Opening", path: "/SBaccount/sb-opening", icon: <LucideIcons.PlusCircle /> },
      { name: "Search SB A/C", path: "/SBaccount/search-sb-acc", icon: <LucideIcons.Search /> },
      { name: "Close SB", path: "/SBaccount/close-sb", icon: <LucideIcons.XCircle /> },
    ],
  },
  {
    name: "CA Account",
    icon: <CreditCardIcon />,
    isExpandable: true,
    subItems: [
      { name: "CA Opening", path: "/CAaccount/ca-opening", icon: <LucideIcons.PlusCircle /> },
      { name: "Search CA A/C", path: "/CAaccount/search-ca-acc", icon: <LucideIcons.Search /> },
      { name: "Close CA", path: "/CAaccount/close-ca", icon: <LucideIcons.XCircle /> },
    ],
  },
  {
    name: "Recurring Deposit",
    icon: <LucideIcons.RefreshCcw />,
    isExpandable: true,
    subItems: [
      { name: "RD Opening", path: "/banking/rd-opening", icon: <LucideIcons.PlusCircle /> },
      { name: "ViewAll / Search", path: "/banking/rd-viewall", icon: <LucideIcons.Search /> },
      { name: "RD Prematurity", path: "/banking/rd-prematurity", icon: <LucideIcons.Undo2 /> },
      { name: "Pay Maturity", path: "/banking/rd-pay-maturity", icon: <PaymentsIcon /> },
      { name: "RD Calculator", path: "/banking/rd-calculator", icon: <LucideIcons.Calculator /> },
    ],
  },
  {
    name: "Fixed Deposit",
    icon: <LockIcon />,
    isExpandable: true,
    subItems: [
      { name: "FD Opening", path: "/banking/fd-opening", icon: <LucideIcons.PlusCircle /> },
      { name: "ViewAll / Search", path: "/banking/fd-viewall", icon: <LucideIcons.Search /> },
      { name: "FD Prematurity", path: "/banking/fd-prematurity", icon: <LucideIcons.Undo2 /> },
      { name: "Pay Maturity", path: "/banking/fd-pay-maturity", icon: <PaymentsIcon /> },
      { name: "FD Calculator", path: "/banking/fd-calculator", icon: <LucideIcons.Calculator /> },
    ],
  },
  {
    name: "PIGMY",
    icon: <LucideIcons.PiggyBank />,
    isExpandable: true,
    subItems: [
      { name: "Account Opening", path: "/banking/pigmy-opening", icon: <LucideIcons.PlusCircle /> },
      { name: "ViewAll / Search", path: "/banking/pigmy-viewall", icon: <LucideIcons.Search /> },
      { name: "Pre Maturity", path: "/banking/pigmy-prematurity", icon: <LucideIcons.Undo2 /> },
      { name: "Pay Maturity", path: "/banking/pigmy-pay-maturity", icon: <PaymentsIcon /> },
      { name: "Calculator", path: "/banking/pigmy-calculator", icon: <LucideIcons.Calculator /> },
    ],
  }, */
  /* {
    name: "MIS",
    icon: <ShowChartIcon />,
    isExpandable: true,
    subItems: [
      { name: "MIS Opening", path: "/banking/mis-opening", icon: <LucideIcons.PlusCircle /> },
      { name: "ViewAll / Search", path: "/banking/mis-viewall", icon: <LucideIcons.Search /> },
      { name: "Pre Maturity", path: "/banking/mis-prematurity", icon: <LucideIcons.Undo2 /> },
      { name: "Pay Maturity", path: "/banking/mis-pay-maturity", icon: <PaymentsIcon /> },
      { name: "Calculator", path: "/banking/mis-calculator", icon: <LucideIcons.Calculator /> },
    ],
  }, */
];

export const AgentSideBarMenuItems: SideBarMenuItemType[] = [
  {
    name: "Dashboard",
    icon: <MuiIcons.Dashboard />,
    path: "/agent/dashboard",
    isExpandable: false,
  },
  {
    name: "Profile",
    icon: <MuiIcons.AccountCircle />,
    path: "/agent/profile",
    isExpandable: false,
  },
  {
    name: "Collections",
    icon: <MuiIcons.ListAlt />,
    path: "/agent/collections",
    isExpandable: false,
  },
  {
    name: "Add New",
    icon: <MuiIcons.AddCircle />,
    path: "/agent/add-new",
    isExpandable: false,
  },
  {
    name: "Report",
    icon: <MuiIcons.Assessment />,
    path: "/agent/report",
    isExpandable: false,
  },
  {
    name: "Logout",
    icon: <LucideIcons.Info />,
    path: "/",
    isExpandable: false,
  },
];
