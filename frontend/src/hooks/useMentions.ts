/**
 * Hook para sistema de @mentions en foro
 */
import { useState, useEffect, useCallback } from 'react';
import { ForoUsuario } from '../types/foro';
import { foroApi } from '../api/client';

interface UseMentionsOptions {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onSelect: (username: string) => void;
}

export const useMentions = ({ textareaRef, onSelect }: UseMentionsOptions) => {
  const [users, setUsers] = useState<ForoUsuario[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ForoUsuario[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mentionStart, setMentionStart] = useState<number>(-1);

  useEffect(() => {
    // Cargar usuarios al montar
    const loadUsers = async () => {
      try {
        const data = await foroApi.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && showDropdown) {
      setShowDropdown(false);
      e.preventDefault();
    }
  }, [showDropdown]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Buscar @ antes del cursor
    let atPos = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === '@') {
        atPos = i;
        break;
      }
      if (text[i] === ' ' || text[i] === '\n') {
        break;
      }
    }

    if (atPos !== -1) {
      const searchTerm = text.substring(atPos + 1, cursorPos).toLowerCase();
      
      // Filtrar usuarios
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.nombre.toLowerCase().includes(searchTerm)
      ).slice(0, 6);

      if (filtered.length > 0) {
        setFilteredUsers(filtered);
        setMentionStart(atPos);
        setShowDropdown(true);

        // Calcular posición del dropdown
        const rect = textarea.getBoundingClientRect();
        const lineHeight = 20;
        const lines = text.substring(0, atPos).split('\n').length;
        
        setDropdownPosition({
          top: rect.top + (lines * lineHeight),
          left: rect.left + 10
        });
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  }, [users]);

  const selectUser = useCallback((username: string) => {
    const textarea = textareaRef.current;
    if (!textarea || mentionStart === -1) return;

    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    // Reemplazar desde @ hasta el cursor
    const before = text.substring(0, mentionStart);
    const after = text.substring(cursorPos);
    const newText = before + '@' + username + ' ' + after;
    
    textarea.value = newText;
    const newCursorPos = mentionStart + username.length + 2;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    setShowDropdown(false);
    onSelect(username);
    
    // Trigger input event para actualizar el estado del componente padre
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  }, [textareaRef, mentionStart, onSelect]);

  return {
    showDropdown,
    filteredUsers,
    dropdownPosition,
    handleInput,
    selectUser,
    closeDropdown: () => setShowDropdown(false)
  };
};

/**
 * Función helper para renderizar texto con @mentions
 */
export const renderMentions = (text: string): string => {
  if (!text) return '';
  
  // Convertir @username a <span class="mention">@username</span>
  return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
};
