<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('consignment_stocks', function (Blueprint $table) {
            $table->id('consignment_id');
            $table->unsignedBigInteger('item_id');
            $table->unsignedBigInteger('vendor_id');
            $table->unsignedBigInteger('warehouse_id');
            $table->float('quantity');
            $table->date('received_date');
            $table->text('notes')->nullable();
            $table->string('status', 50)->default('active');
            $table->timestamps();
            
            $table->foreign('item_id')->references('item_id')->on('items');
            $table->foreign('vendor_id')->references('vendor_id')->on('vendors');
            $table->foreign('warehouse_id')->references('warehouse_id')->on('warehouses');
        });
    }

    public function down()
    {
        Schema::dropIfExists('consignment_stocks');
    }
};