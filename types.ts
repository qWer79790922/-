export interface ApprovalStep {
  role: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date?: string;
}

export interface Contract {
  id: string;
  no: string;
  dept: string;
  vendor: string;
  content: string;
  startDate: string;
  endDate: string;
  renewal: string;
  handler: string;
  appDate: string;
  finalDate: string;
  note: string;
  file?: File | string | null; 
  isDisabled?: boolean;
  approvals?: ApprovalStep[]; // 新增簽核進度資料
  isLendingCompleted?: boolean; // 新增借閱完成狀態
  isManagerConfirmed?: boolean; // 新增合約管理者確認狀態
}

export enum ViewMode {
  ALL = 'ALL', 
  HOME = 'HOME', 
  INVALID = 'INVALID', 
  UPCOMING = 'UPCOMING', 
  EXPIRED = 'EXPIRED', 
  OVERDUE = 'OVERDUE', 
  NEW_CONTRACT = 'NEW_CONTRACT',
  LENDING_FORM = 'LENDING_FORM',
  OVERDUE_FORM = 'OVERDUE_FORM',
  LENDING_LIST = 'LENDING_LIST',
  OVERDUE_LIST = 'OVERDUE_LIST'
}

export interface MenuItem {
  label: string;
  view?: ViewMode;
  action?: () => void;
}