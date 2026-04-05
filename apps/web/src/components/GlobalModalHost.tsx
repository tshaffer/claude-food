import React from 'react';
import { useAppSelector } from '../store/hooks.js';
import { selectModal } from '../store/selectors.js';
import AddLogEntryModal from './modals/AddLogEntryModal.js';
import EditLogEntryModal from './modals/EditLogEntryModal.js';
import AddFromTemplateModal from './modals/AddFromTemplateModal.js';
import FoodModal from './modals/FoodModal.js';

export default function GlobalModalHost() {
  const modal = useAppSelector(selectModal);

  switch (modal.type) {
    case 'addLogEntry':
      return <AddLogEntryModal initialDate={modal.initialDate} initialMeal={modal.initialMeal} />;
    case 'editLogEntry':
      return <EditLogEntryModal entryId={modal.entryId} />;
    case 'addFromTemplate':
      return <AddFromTemplateModal initialDate={modal.initialDate} initialMeal={modal.initialMeal} />;
    case 'addFood':
      return <FoodModal />;
    case 'editFood':
      return <FoodModal foodId={modal.foodId} />;
    default:
      return null;
  }
}
