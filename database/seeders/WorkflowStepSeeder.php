<?php
namespace Database\Seeders;

use App\Models\WorkflowType;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class WorkflowStepSeeder extends Seeder
{
    public function run(): void
    {
        $types = WorkflowType::all();
        foreach ($types as $type) {
            if ($type->steps()->count() > 0) continue;

            if ($type->name === 'Plant Purchase') {
                $steps = [
                    ['step_order' => 1, 'step_name' => 'department_head', 'label' => 'Department Head', 'role_name' => 'department_head'],
                    ['step_order' => 2, 'step_name' => 'ed', 'label' => 'Executive Director (ED)', 'role_name' => 'executive_director'],
                    ['step_order' => 3, 'step_name' => 'counter_ed', 'label' => 'Counter ED', 'role_name' => 'counter_ed'],
                    ['step_order' => 4, 'step_name' => 'scm_head', 'label' => 'SCM Head', 'role_name' => 'scm_head'],
                    ['step_order' => 5, 'step_name' => 'finance_head', 'label' => 'Finance Head', 'role_name' => 'finance_head'],
                ];
            } elseif ($type->name === 'Head Office Purchase') {
                $steps = [
                    ['step_order' => 1, 'step_name' => 'line_manager', 'label' => 'Line Manager', 'role_name' => 'line_manager'],
                    ['step_order' => 2, 'step_name' => 'department_head', 'label' => 'Department Head', 'role_name' => 'department_head'],
                    ['step_order' => 3, 'step_name' => 'scm_head', 'label' => 'SCM Head', 'role_name' => 'scm_head'],
                    ['step_order' => 4, 'step_name' => 'finance_head', 'label' => 'Finance Head', 'role_name' => 'finance_head'],
                ];
            } else {
                continue;
            }

            foreach ($steps as $s) {
                WorkflowStep::create(array_merge($s, ['workflow_type_id' => $type->id]));
            }
        }
    }
}
