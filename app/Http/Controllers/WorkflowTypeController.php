<?php
namespace App\Http\Controllers;

use App\Models\WorkflowType;
use App\Models\WorkflowStep;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowTypeController extends Controller
{
    public function index()
    {
        $types = WorkflowType::with('steps')->orderBy('name')->get();
        return Inertia::render('WorkflowTypes', ['types' => $types]);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:255|unique:workflow_types,name',
            'description' => 'nullable|string',
            'steps' => 'required|array|min:1',
            'steps.*.step_name' => 'required|string|max:255',
            'steps.*.label' => 'required|string|max:255',
            'steps.*.role_name' => 'required|string|max:255',
        ]);

        $type = WorkflowType::create(['name' => $data['name'], 'description' => $data['description'] ?? null]);

        foreach ($data['steps'] as $i => $step) {
            WorkflowStep::create([
                'workflow_type_id' => $type->id,
                'step_order' => $i + 1,
                'step_name' => $step['step_name'],
                'label' => $step['label'],
                'role_name' => $step['role_name'],
            ]);
        }

        return back()->with('success', 'Workflow type created');
    }

    public function update(Request $r, WorkflowType $workflowType)
    {
        $data = $r->validate([
            'name' => 'required|string|max:255|unique:workflow_types,name,' . $workflowType->id,
            'description' => 'nullable|string',
            'steps' => 'required|array|min:1',
            'steps.*.step_name' => 'required|string|max:255',
            'steps.*.label' => 'required|string|max:255',
            'steps.*.role_name' => 'required|string|max:255',
        ]);

        $workflowType->update(['name' => $data['name'], 'description' => $data['description'] ?? null]);

        // Delete old steps and recreate
        $workflowType->steps()->delete();
        foreach ($data['steps'] as $i => $step) {
            WorkflowStep::create([
                'workflow_type_id' => $workflowType->id,
                'step_order' => $i + 1,
                'step_name' => $step['step_name'],
                'label' => $step['label'],
                'role_name' => $step['role_name'],
            ]);
        }

        return back()->with('success', 'Workflow type updated');
    }

    public function destroy(WorkflowType $workflowType)
    {
        $workflowType->delete();
        return back()->with('success', 'Workflow type deleted');
    }
}
