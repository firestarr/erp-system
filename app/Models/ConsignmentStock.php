<?php
// app/Models/ConsignmentStock.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsignmentStock extends Model
{
    use HasFactory;

    protected $primaryKey = 'consignment_id';
    protected $fillable = [
        'item_id', 
        'vendor_id', 
        'warehouse_id', 
        'quantity', 
        'received_date',
        'notes',
        'status'
    ];

    protected $casts = [
        'received_date' => 'date',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id', 'item_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id', 'vendor_id');
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id', 'warehouse_id');
    }
}