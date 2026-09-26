export type Complaint = {
  id: number;
  orderItemId: number;
  orderId: number;
  figurineName: string;
  figurineImageUrl: string | null;
  customerName: string;
  sellerStoreName: string;
  type: string;
  category: string | null;
  requestedResolution: string;
  subject: string;
  status: string;
  resolutionOutcome: string | null;
  createdAt: string;
  escalatedToAdmin: boolean;
  commentCount: number;
};

export type ComplaintComment = {
  id: number;
  userId: number;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
};

export type ComplaintImage = {
  id: number;
  imageUrl: string;
  sortOrder: number;
};

export type ComplaintDetail = Complaint & {
  comments: ComplaintComment[];
  images: ComplaintImage[];
};

export type Return = {
  id: number;
  orderItemId: number;
  orderId: number;
  complaintId: number | null;
  figurineName: string;
  figurineImageUrl: string | null;
  customerName: string;
  sellerStoreName: string;
  reason: string;
  description: string;
  status: string;
  rejectionReason: string | null;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  createdAt: string;
  refundedAt: string | null;
};
