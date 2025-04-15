<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConsignmentStockRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Add authorization logic if needed
    }

    public function rules()
    {
        return [
            'item_id' => 'required|exists:items,item_id',
            'vendor_id' => 'required|exists:vendors,vendor_id',
            'warehouse_id' => 'required|exists:warehouses,warehouse_id',
            'quantity' => 'required|numeric|min:0.01',
            'received_date' => 'required|date',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,pending,closed,returned'
        ];
    }
}