-- Add 'unpaid' to order_status enum so failed/cancelled payments can mark orders as unpaid
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'unpaid';
