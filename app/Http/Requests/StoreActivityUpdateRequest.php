<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActivityUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['done', 'pending'])],
            'remark' => 'nullable|string|max:2000',
            'updated_for_date' => 'required|date',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be either "done" or "pending".',
            'remark.max' => 'Remark cannot exceed 2000 characters.',
            'updated_for_date.required' => 'Date is required.',
            'updated_for_date.date' => 'Please provide a valid date.',
        ];
    }
}
