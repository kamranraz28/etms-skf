<?php
namespace Database\Seeders;

use App\Models\WorkflowType;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class WorkflowTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Plant Purchase (for CS)
        $plant = WorkflowType::firstOrCreate([
            'name' => 'Plant Purchase',
        ], [
            'description' => 'Approval workflow for plant purchases',
        ]);
        if ($plant->steps()->count() === 0) {
            $plantSteps = [
                ['step_order' => 1, 'step_name' => 'department_head', 'label' => 'Department Head', 'role_name' => 'department_head'],
                ['step_order' => 2, 'step_name' => 'ed', 'label' => 'Executive Director (ED)', 'role_name' => 'executive_director'],
                ['step_order' => 3, 'step_name' => 'counter_ed', 'label' => 'Counter ED', 'role_name' => 'counter_ed'],
                ['step_order' => 4, 'step_name' => 'scm_head', 'label' => 'SCM Head', 'role_name' => 'scm_head'],
                ['step_order' => 5, 'step_name' => 'finance_head', 'label' => 'Finance Head', 'role_name' => 'finance_head'],
            ];
            foreach ($plantSteps as $s) {
                WorkflowStep::create(array_merge($s, ['workflow_type_id' => $plant->id]));
            }
        }

        // Head Office Purchase (for CS)
        $ho = WorkflowType::firstOrCreate([
            'name' => 'Head Office Purchase',
        ], [
            'description' => 'Approval workflow for head office purchases',
        ]);
        if ($ho->steps()->count() === 0) {
            $hoSteps = [
                ['step_order' => 1, 'step_name' => 'line_manager', 'label' => 'Line Manager', 'role_name' => 'line_manager'],
                ['step_order' => 2, 'step_name' => 'department_head', 'label' => 'Department Head', 'role_name' => 'department_head'],
                ['step_order' => 3, 'step_name' => 'scm_head', 'label' => 'SCM Head', 'role_name' => 'scm_head'],
                ['step_order' => 4, 'step_name' => 'finance_head', 'label' => 'Finance Head', 'role_name' => 'finance_head'],
            ];
            foreach ($hoSteps as $s) {
                WorkflowStep::create(array_merge($s, ['workflow_type_id' => $ho->id]));
            }
        }

        // Plant / Other Bill
        $plantBill = WorkflowType::firstOrCreate([
            'name' => 'Plant / Other Bill',
        ], [
            'description' => 'Bill claim workflow for plant and other bills',
        ]);
        if ($plantBill->steps()->count() === 0) {
            $steps = [
                ['step_order' => 1, 'step_name' => 'user', 'label' => 'User', 'role_name' => 'user'],
                ['step_order' => 2, 'step_name' => 'line_manager', 'label' => 'Line Manager', 'role_name' => 'line_manager'],
                ['step_order' => 3, 'step_name' => 'unit_head', 'label' => 'Unit Head', 'role_name' => 'unit_head'],
                ['step_order' => 4, 'step_name' => 'ed', 'label' => 'Executive Director (ED)', 'role_name' => 'executive_director'],
                ['step_order' => 5, 'step_name' => 'scm_user', 'label' => 'SCM User', 'role_name' => 'scm_user'],
                ['step_order' => 6, 'step_name' => 'scm_head', 'label' => 'SCM Head', 'role_name' => 'scm_head'],
                ['step_order' => 7, 'step_name' => 'finance', 'label' => 'Finance', 'role_name' => 'finance_head'],
            ];
            foreach ($steps as $s) {
                WorkflowStep::create(array_merge($s, ['workflow_type_id' => $plantBill->id]));
            }
        }

        // OHQ Packing Material Bill
        $ohqBill = WorkflowType::firstOrCreate([
            'name' => 'OHQ Packing Material Bill',
        ], [
            'description' => 'Bill claim workflow for OHQ packing material bills',
        ]);
        if ($ohqBill->steps()->count() === 0) {
            $steps = [
                ['step_order' => 1, 'step_name' => 'scm_user', 'label' => 'SCM User', 'role_name' => 'scm_user'],
                ['step_order' => 2, 'step_name' => 'line_manager', 'label' => 'Line Manager', 'role_name' => 'line_manager'],
                ['step_order' => 3, 'step_name' => 'scm_head', 'label' => 'SCM Head', 'role_name' => 'scm_head'],
                ['step_order' => 4, 'step_name' => 'finance', 'label' => 'Finance', 'role_name' => 'finance_head'],
            ];
            foreach ($steps as $s) {
                WorkflowStep::create(array_merge($s, ['workflow_type_id' => $ohqBill->id]));
            }
        }
    }
}
