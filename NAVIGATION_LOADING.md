# Navigation Loading Functionality

This document explains the navigation loading functionality that has been added to the LMS application.

## Overview

The navigation loading system provides visual feedback during page transitions and user interactions. It includes:

1. **Automatic Navigation Loading**: Shows loading states during route changes
2. **Manual Loading Controls**: Custom hooks for programmatic loading states
3. **Loading Components**: Reusable UI components for loading states

## Components

### LoadingSpinner

A reusable spinner component with different sizes and configurations.

```tsx
import { LoadingSpinner } from "@/components/loading-spinner";

// Basic usage
<LoadingSpinner />

// With custom size and text
<LoadingSpinner 
  size="lg" 
  text="جاري التحميل..." 
  fullScreen 
/>
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `text`: Optional loading text
- `fullScreen`: Boolean to show as full-screen overlay
- `className`: Custom CSS classes

### LoadingButton

A button component that shows loading state with spinner.

```tsx
import { LoadingButton } from "@/components/ui/loading-button";

<LoadingButton
  loading={isLoading}
  loadingText="جاري التحميل..."
  onClick={handleClick}
>
  Submit
</LoadingButton>
```

**Props:**
- `loading`: Boolean to show loading state
- `loadingText`: Text to show during loading
- All standard button props

### NavigationLoading

A component that automatically shows loading during navigation.

```tsx
import { NavigationLoading } from "@/components/navigation-loading";

<NavigationLoading 
  showProgress={true}
  progressColor="#211FC3"
/>
```

## Hooks

### useNavigationLoading

A custom hook for manual loading control.

```tsx
import { useNavigationLoading } from "@/hooks/use-navigation-loading";

const { isLoading, startLoading, stopLoading, navigateWithLoading } = useNavigationLoading();

// Manual loading control
const handleAction = async () => {
  startLoading();
  try {
    await someAsyncAction();
  } finally {
    stopLoading();
  }
};

// Navigation with loading
const handleNavigation = async () => {
  await navigateWithLoading("/dashboard");
};
```

## Usage Examples

### 1. Sidebar Navigation

The sidebar items now show loading states during navigation:

```tsx
// In sidebar-item.tsx
const { navigateWithLoading } = useNavigationLoading();

const onClick = async () => {
  if (!isActive) {
    await navigateWithLoading(href);
  }
};
```

### 2. Form Submissions

Use LoadingButton for form submissions:

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await submitForm();
  } finally {
    setIsLoading(false);
  }
};

return (
  <LoadingButton
    type="submit"
    loading={isLoading}
    loadingText="جاري الإرسال..."
  >
    Submit
  </LoadingButton>
);
```

### 3. Logout Actions

Logout buttons now show loading states:

```tsx
const [isLoggingOut, setIsLoggingOut] = useState(false);

const handleLogout = async () => {
  setIsLoggingOut(true);
  try {
    await signOut({ callbackUrl: "/" });
  } finally {
    setIsLoggingOut(false);
  }
};

return (
  <LoadingButton
    onClick={handleLogout}
    loading={isLoggingOut}
    loadingText="جاري تسجيل الخروج..."
  >
    تسجيل الخروج
  </LoadingButton>
);
```

## Automatic Navigation Loading

The `NavigationLoadingProvider` automatically shows loading states during route changes. It's already integrated into the main providers:

```tsx
// In components/providers.tsx
<NavigationLoadingProvider>
  {children}
</NavigationLoadingProvider>
```

## Customization

### Custom Loading Text

You can customize loading text based on the action:

```tsx
<LoadingButton
  loading={isSaving}
  loadingText="جاري الحفظ..."
>
  حفظ التغييرات
</LoadingButton>
```

### Custom Progress Colors

For the navigation loading component:

```tsx
<NavigationLoading 
  progressColor="#your-color"
  showProgress={true}
/>
```

### Custom Spinner Sizes

```tsx
<LoadingSpinner size="xl" />
<LoadingSpinner size="lg" />
<LoadingSpinner size="md" />
<LoadingSpinner size="sm" />
```

## Best Practices

1. **Use LoadingButton for form submissions** - Provides better UX than manual loading states
2. **Show loading for async operations** - Any operation that takes time should show loading
3. **Use descriptive loading text** - Tell users what's happening
4. **Keep loading states brief** - Don't show loading for very fast operations
5. **Handle errors gracefully** - Always stop loading in finally blocks

## Integration Points

The loading functionality is integrated into:

- ✅ Sidebar navigation
- ✅ Logout buttons
- ✅ Form submissions
- ✅ Course navigation
- ✅ Authentication flows

## Future Enhancements

- [ ] Add loading states for API calls
- [ ] Implement skeleton loading for content
- [ ] Add loading animations for specific components
- [ ] Create loading states for file uploads 