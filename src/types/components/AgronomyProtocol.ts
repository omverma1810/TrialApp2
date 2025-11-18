export interface AgronomyProtocolProps {
  experimentID?: string;
  locationID?: string;
  cropId?: string;
}

export interface Product {
  product_id: number;
  name: string;
  product_dosage: string;
  product_dosage_unit: string;
  product_application_method: string;
}

export interface TaskProtocol {
  id: number;
  taskTypeName: string;
  products: Product[];
  is_default: boolean;
  task: string;
  days_of_sowing: number;
  notes: string;
  expected_yield: number | null;
  expected_yield_uom: string;
  progress_interval: number;
  threshold: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  growth_stage: string;
  farm: number | null;
  crop_protocol: number;
  crop: number;
  TaskType: number;
  product: number | null;
  phenotype: number[];
  min_days_of_sowing: number;
  max_days_of_sowing: number;
  growthStage: string;
  isMarkAsCompleted: boolean;
  completedOn: string | null;
  delayReason: string | null;
  traits: number[];
  locationId: number | null;
}

export interface AgronomyProtocolData {
  crop_protocol_id: number;
  crop_protocol_name: string | null;
  crop_name: string;
  is_trial_specific: boolean;
  trial_meta_id: number;
  task_protocol: TaskProtocol[];
  protocol_type: string;
  sowing_date: string;
  due_date: string;
  max_threshold_date: string;
}

export interface AgronomyProtocolResponse {
  status_code: number;
  status: string;
  message: string;
  data: AgronomyProtocolData[];
}

export interface UpdateTaskStatusPayload {
  locationId: number | null;
  isMarkAsCompleted: boolean;
  delayReason: string;
  completedOn: string;
}

export interface UpdateTaskStatusResponse {
  status_code: number;
  status: string;
  message: string;
  data?: any;
}

export interface ProtocolTask {
  id: number;
  protocolName: string;
  stageName: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'due_soon' | 'completed';
  completedDate?: string;
  plotCount: number;
  daysSinceSowing?: number;
  locationId: number | null;
  delayReason?: string | null;
}

export interface ProtocolProgressProps {
  totalTasks: number;
  completedTasks: number;
}

export interface ProtocolQuickFiltersProps {
  selectedFilter: 'all' | 'pending' | 'due_soon' | 'overdue';
  onFilterChange: (filter: 'all' | 'pending' | 'due_soon' | 'overdue') => void;
}

export interface ProtocolAccordionProps {
  task: ProtocolTask;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkAsDone: (taskId: number, delayReason?: string) => void;
}

export interface ProtocolStageGroupProps {
  stageName: string;
  tasks: ProtocolTask[];
  expandedTasks: Set<number>;
  onToggleTask: (taskId: number) => void;
  onMarkAsDone: (taskId: number, delayReason?: string) => void;
}
