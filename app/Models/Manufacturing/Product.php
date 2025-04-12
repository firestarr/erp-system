<?php

namespace App\Models\Manufacturing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $table = 'items';
    protected $primaryKey = 'item_id';
    public $timestamps = false;
    
    protected $fillable = [
        'item_code',
        'name',
        'description',
        'category_id',
        'uom_id',
    ];

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ItemCategory::class, 'category_id', 'category_id');
    }

    /**
     * Get the unit of measure that owns the product.
     */
    public function unitOfMeasure(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'uom_id', 'uom_id');
    }

    /**
     * Get the BOMs for the product.
     */
    public function boms(): HasMany
    {
        return $this->hasMany(BOM::class, 'item_id', 'item_id');
    }

    /**
     * Get the routings for the product.
     */
    public function routings(): HasMany
    {
        return $this->hasMany(Routing::class, 'item_id', 'item_id');
    }

    /**
     * Get the work orders for the product.
     */
    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class, 'item_id', 'item_id');
    }
}