import { useStaff } from '../../context/StaffContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Skeleton } from '../ui/Skeleton';
import { useState } from 'react';
import { staffApi } from '../../utils/api';

export function MenuManagement() {
  const { menu, categories, activeTab, runAction, loading, token } = useStaff();
  const [newCategory, setNewCategory] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '', category_id: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (activeTab !== 'menu') return null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
        <SkeletonGrid count={6} variant="menu-item" columns={1} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-staff-900">Menu & Categories</h2>
          <p className="text-sm text-staff-500">Changes sync live to open tables</p>
        </div>
      </div>

      {/* Add Category */}
      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-staff-900 mb-4">Add Category</h3>
        <div className="flex gap-3">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => {
              if (!newCategory.trim()) return;
              runAction(
                () => staffApi.createCategory(token, newCategory),
                'Category added.'
              );
              setNewCategory('');
            }}
          >
            Add Category
          </Button>
        </div>
      </Card>

      {/* Category Chips */}
      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-staff-900 mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span key={category.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-staff-100 rounded-full text-sm font-medium text-staff-700">
              {category.name}
              <button
                onClick={() => runAction(
                  () => staffApi.deleteCategory(category.id, token),
                  `${category.name} removed.`
                )}
                className="text-staff-400 hover:text-error-500 transition-colors"
                aria-label={`Delete ${category.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </Card>

      {/* Add Menu Item */}
      <Card variant="elevated" padding="lg">
        <h3 className="font-semibold text-staff-900 mb-4">Add Menu Item</h3>
        <AddItemForm categories={categories} token={token} runAction={runAction} />
      </Card>

      {/* Menu Items List */}
      <Card variant="elevated" padding="none">
        <div className="p-4 border-b border-staff-200">
          <h3 className="font-semibold text-staff-900">Menu Items</h3>
        </div>
        <div className="divide-y divide-staff-200">
          {menu.map((item) => (
            <MenuAdminItem
              key={item.id}
              item={item}
              categories={categories}
              onEdit={setEditingItem}
              onDelete={setDeleteConfirm}
              onToggleAvailability={(state) => runAction(
                () => staffApi.updateAvailability(item.id, token, state),
                `${item.name} is now ${state.toLowerCase()}.`
              )}
              onToggleSpecial={(isSpecial) => runAction(
                () => staffApi.toggleSpecial(item.id, token, isSpecial),
                `${item.name} special status updated.`
              )}
            />
          ))}

          {menu.length === 0 && (
            <div className="p-8 text-center text-staff-500">
              No menu items yet. Add your first item above.
            </div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title="Edit Menu Item"
          size="md"
        >
          <EditItemForm
            item={editingItem}
            form={editForm}
            onChange={setEditForm}
            onSave={() => {
              runAction(
                () => staffApi.updateMenuItem(editingItem.id, token, editForm),
                'Menu item updated.'
              );
              setEditingItem(null);
            }}
            categories={categories}
          />
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Menu Item"
          size="sm"
        >
          <p className="text-staff-600 mb-6">Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => {
              runAction(
                () => staffApi.deleteMenuItem(deleteConfirm.id, token),
                `${deleteConfirm.name} deleted.`
              );
              setDeleteConfirm(null);
            }}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AddItemForm({ categories, token, runAction }) {
  const [form, setForm] = useState({ name: '', price: '', category_id: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category_id) return;
    runAction(
      () => staffApi.createMenuItem(token, form),
      'Menu item added.'
    );
    setForm({ name: '', price: '', category_id: '', description: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Item Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          placeholder="e.g. Chicken Momo"
        />
        <Input
          label="Price (Rs.)"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          placeholder="180.00"
        />
      </div>
      <Select
        label="Category"
        value={form.category_id}
        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        required
        options={categories.map(c => ({ value: c.id, label: c.name }))}
        placeholder="Choose category"
      />
      <Input
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Short description"
      />
      <Button variant="primary" type="submit">Add Item</Button>
    </form>
  );
}

function EditItemForm({ item, form, onChange, onSave, categories }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Item Name"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Price (Rs.)"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => onChange({ ...form, price: e.target.value })}
          required
        />
      </div>
      <Select
        label="Category"
        value={form.category_id}
        onChange={(e) => onChange({ ...form, category_id: e.target.value })}
        options={categories.map(c => ({ value: c.id, label: c.name }))}
        placeholder="Choose category"
      />
      <Input
        label="Description"
        value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })}
      />
      <div className="flex justify-end gap-3 pt-4 border-t border-staff-200">
        <Button variant="secondary" onClick={() => onChange({ name: '', price: '', category_id: '', description: '' })}>Cancel</Button>
        <Button variant="primary" onClick={onSave}>Save</Button>
      </div>
    </div>
  );
}

function MenuAdminItem({ item, categories, onEdit, onDelete, onToggleAvailability, onToggleSpecial }) {
  const availabilityOrder = ['AVAILABLE', 'UNAVAILABLE', 'HIDDEN'];
  const currentIndex = availabilityOrder.indexOf(item.state);
  const nextState = availabilityOrder[(currentIndex + 1) % availabilityOrder.length];

  return (
    <div className="p-4 hover:bg-staff-50/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className="font-medium text-staff-900">{item.name}</h4>
            <Badge variant={item.state.toLowerCase()} dot>{item.state}</Badge>
            {item.is_special && <Badge variant="special">★ Special</Badge>}
            {item.is_vegetarian === true && <Badge variant="veg" size="sm">Veg</Badge>}
            {item.is_vegetarian === false && <Badge variant="nonveg" size="sm">Non-veg</Badge>}
          </div>
          <p className="mt-1 text-sm text-staff-500">{item.description || 'No description'}</p>
          <p className="mt-1 text-sm font-medium text-staff-900">Rs. {Number(item.unit_price).toFixed(0)}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onToggleAvailability(nextState)}
            className="whitespace-nowrap"
          >
            {item.state === 'AVAILABLE' ? 'Mark Unavailable' : item.state === 'UNAVAILABLE' ? 'Hide' : 'Make Available'}
          </Button>
          <Button
            variant={item.is_special ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onToggleSpecial(!item.is_special)}
          >
            {item.is_special ? 'Special Today' : 'Set Special'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onEdit(item)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(item)}>Delete</Button>
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 6, variant = 'card', columns = 1, className = '' }) {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} variant={variant} className="h-24" />)}
    </div>
  );
}