// ============================================
// API ENVELOPE
// ============================================

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  correlationId: string;
}

// ============================================
// AUTH TYPES
// ============================================

export type UserRole = 'Admin' | 'Dispatcher' | 'Driver' | 'Viewer';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
}

export interface User {
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 'Created' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
export type OrderPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type ServiceLevel = 'Express' | 'Standard' | 'Economy';

export type WeightUnit = 'Kg' | 'G' | 'Jin' | 'Lb';

export interface Weight {
  value: number;
  unit: WeightUnit;
}

export interface Dimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
}

export interface OrderItem {
  description: string;
  quantity: number;
  weight: Weight;
  dimensions: Dimensions | null;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  priority: OrderPriority;
  serviceLevel: ServiceLevel;
  amount: number;
  currency: string;
  region: string;
  customerId: string;
  assignedDriverId?: string;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  origin: string;
  destination: string;
  status: OrderStatus;
  serviceLevel: ServiceLevel;
  trackingNumber: string | null;
  carrierCode: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  origin: Address;
  destination: Address;
  serviceLevel: ServiceLevel;
  items: OrderItem[];
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
}

export interface OrderTransitionResponse {
  orderId: string;
  newStatus: OrderStatus;
  carrierCode: string | null;
  trackingNumber: string | null;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalOrders: number;
  statusBreakdown: Record<OrderStatus, number>;
  recentOrders: OrderSummary[];
}

export interface CarrierPerformance {
  carrierCode: string;
  carrierName: string;
  totalShipments: number;
  avgDeliveryDays: number;
  successRate: number;
}

export interface TopCustomer {
  customerName: string;
  totalOrders: number;
  totalSpent: number;
}

// ============================================
// CARRIER TYPES
// ============================================

export interface Carrier {
  code: string;
  name: string;
  services: string[];
  rating: number;
  priceRange: string;
}

export interface QuoteRequest {
  origin: Address;
  destination: Address;
  weight: Weight;
  serviceLevel: ServiceLevel;
}

export interface Quote {
  carrierCode: string;
  carrierName: string;
  cost: number;
  currency: string;
  estimatedDays: number;
  serviceLevel: string;
}

export interface BookingRequest {
  orderId: string;
  quoteId?: string;
}

export interface BookingResponse {
  bookingId: string;
  trackingNumber: string;
  carrierCode: string;
  estimatedDelivery: string;
}

export interface CarrierListItem {
  carrierCode: string;
  name: string;
  services: ServiceLevel[];
  rating: number;
  priceRange: string;
}

export interface CarrierQuoteItem {
  carrierCode: string;
  price: {
    amount: number;
    currency: string;
  };
  estimatedDays: number;
  serviceLevel: ServiceLevel;
}

export interface CarrierQuoteRequest {
  origin: Address;
  destination: Address;
  weight: Weight;
  serviceLevel: ServiceLevel;
}

export interface CarrierQuoteResponse {
  quotes: CarrierQuoteItem[];
  recommended: {
    carrierCode: string;
    reason: string;
  };
}

export interface CarrierBookContact {
  name: string;
  phone: string;
  email: string;
}

export interface CarrierBookRequest {
  origin: Address;
  destination: Address;
  weight: Weight;
  sender: CarrierBookContact;
  recipient: CarrierBookContact;
  serviceLevel: ServiceLevel;
}

export interface CarrierBookResponse {
  carrierCode: string;
  trackingNumber: string;
  bookedAt: string;
}

export interface CarrierTrackResponse {
  trackingNumber: string;
  status: string;
  currentLocation: string;
  updatedAt: string;
}

// ============================================
// TRACKING TYPES
// ============================================

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrierCode: string;
  currentStatus: string;
  estimatedDelivery: string | null;
  events: TrackingEvent[];
}

// ============================================
// ROUTING TYPES
// ============================================

export type RoutingStrategy = 'Fastest' | 'Cheapest' | 'Balanced';

export interface RouteCalculation {
  strategy: RoutingStrategy;
  carrierCode: string;
  carrierName: string;
  cost: number;
  estimatedDays: number;
  distanceKm: number;
}

export interface RouteCompareRequest {
  origin: Address;
  destination: Address;
  weight: Weight;
  serviceLevel: ServiceLevel;
}

export interface RoutingCoordinate {
  latitude: number;
  longitude: number;
}

export interface RoutingApiRequest {
  origin: RoutingCoordinate;
  destination: RoutingCoordinate;
  packageWeight: Weight;
  serviceLevel: ServiceLevel;
}

export interface RoutingCompareInput {
  originCity: string;
  destinationCity: string;
  packageWeight: Weight;
  serviceLevel: ServiceLevel;
}

export interface RoutingStrategyResult {
  strategyUsed: RoutingStrategy;
  waypointNodeIds: string[];
  distanceKm: number;
  estimatedDuration: string;
  estimatedCost: {
    amount: number;
    currency: string;
  };
  carrierCode?: string;
  carrierName?: string;
  geometry: GeoJSON.Feature<GeoJSON.LineString>;
}

// ============================================
// AUDIT TYPES
// ============================================

export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  username: string;
  timestamp: string;
  details: string;
}

// ============================================
// REPORT TYPES
// ============================================

export interface MonthlyShipment {
  month: string;
  totalShipments: number;
  byServiceLevel: Record<ServiceLevel, number>;
}

export interface RevenueByCarrier {
  carrierCode: string;
  carrierName: string;
  revenue: number;
  shipmentCount: number;
}

export interface MonthlyShipmentItem {
  orderId: string;
  orderNumber: string;
  customerName: string;
  origin: string;
  destination: string;
  status: OrderStatus;
  serviceLevel: ServiceLevel;
  carrierCode: string;
  trackingNumber: string;
  cost: number;
  costCurrency: string;
  createdAt: string;
}

export interface MonthlyShipmentsReport {
  year: number;
  month: number;
  totalShipments: number;
  totalRevenue: number;
  currency: string;
  shipments: MonthlyShipmentItem[];
}

export interface RevenueByCarrierItem {
  carrierCode: string;
  carrierName: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  percentageOfTotal: number;
}

export interface RevenueByCarrierReport {
  fromDate: string;
  toDate: string;
  grandTotal: number;
  currency: string;
  carriers: RevenueByCarrierItem[];
}

// ============================================
// DELIVERY AGENT TYPES (for tracking page)
// ============================================

export type AgentStatus = 'Available' | 'OnDelivery' | 'Offline' | 'Break';

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  status: AgentStatus;
  currentLocation: {
    lat: number;
    lng: number;
  };
  assignedOrders: string[];
  region: string;
  vehicleType: 'bike' | 'van' | 'truck';
  rating: number;
  totalDeliveries: number;
}

// ============================================
// FILTER & SORT TYPES
// ============================================

export interface OrderFilters {
  status?: OrderStatus[];
  priority?: OrderPriority[];
  region?: string[];
  serviceLevel?: ServiceLevel[];
  search?: string | null;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export type SortField =
  | 'orderNumber'
  | 'customerName'
  | 'status'
  | 'priority'
  | 'serviceLevel'
  | 'amount'
  | 'region'
  | 'createdAt'
  | 'updatedAt';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// ============================================
// REAL-TIME UPDATE TYPES
// ============================================

export interface AgentUpdate {
  agentId: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
}

export type TrackingLegType = 'LocalPickup' | 'InternationalShip' | 'InternationalPlane' | 'LocalDropoff';

export interface TrackingRouteLeg {
  id: string;
  legType: TrackingLegType;
  label: string;
  icon: 'bike' | 'van' | 'truck' | 'ship' | 'plane';
  distanceKm: number;
  geometry: GeoJSON.Feature<GeoJSON.LineString>;
}

export interface MultiLegRoute {
  routeId: string;
  totalDistanceKm: number;
  remainingDistanceKm: number;
  destination: {
    name: string;
    lat: number;
    lng: number;
  };
  legs: TrackingRouteLeg[];
}

// ============================================
// UI TYPES
// ============================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
