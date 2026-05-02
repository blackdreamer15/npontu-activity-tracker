<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->index('is_active', 'activities_is_active_idx');
            $table->index('created_by', 'activities_created_by_idx');
            $table->index('created_at', 'activities_created_at_idx');
        });

        Schema::table('activity_updates', function (Blueprint $table) {
            $table->index('updated_for_date', 'updates_updated_for_date_idx');
            $table->index('status', 'updates_status_idx');
            $table->index('user_id', 'updates_user_id_idx');
            $table->index(['activity_id', 'updated_for_date'], 'updates_activity_date_idx');
        });

        // PostgreSQL-specific: trigram indexes for fast LIKE %search% queries
        if (config('database.default') === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
            DB::statement('CREATE INDEX IF NOT EXISTS activities_title_trgm_idx ON activities USING GIN (title gin_trgm_ops)');
            DB::statement('CREATE INDEX IF NOT EXISTS activities_desc_trgm_idx ON activities USING GIN (description gin_trgm_ops)');
            DB::statement('CREATE INDEX IF NOT EXISTS updates_remark_trgm_idx ON activity_updates USING GIN (remark gin_trgm_ops)');
        }
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropIndex('activities_is_active_idx');
            $table->dropIndex('activities_created_by_idx');
            $table->dropIndex('activities_created_at_idx');
        });

        Schema::table('activity_updates', function (Blueprint $table) {
            $table->dropIndex('updates_updated_for_date_idx');
            $table->dropIndex('updates_status_idx');
            $table->dropIndex('updates_user_id_idx');
            $table->dropIndex('updates_activity_date_idx');
        });

        if (config('database.default') === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS activities_title_trgm_idx');
            DB::statement('DROP INDEX IF EXISTS activities_desc_trgm_idx');
            DB::statement('DROP INDEX IF EXISTS updates_remark_trgm_idx');
        }
    }
};
