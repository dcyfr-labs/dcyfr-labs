export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export interface FilterBadgesProps {
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  className?: string;
  /** Map item values to display labels (e.g., { "community": "Community" }) */
  displayMap?: Record<string, string>;
  /** If true, compare selected items case-insensitively */
  caseInsensitive?: boolean;
}

export interface FilterSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
}

export interface FilterClearButtonProps {
  onClear: () => void;
  count: number;
  visible: boolean;
  className?: string;
}
