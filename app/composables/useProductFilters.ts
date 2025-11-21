/**
 * Product filtering composable with clean separation of concerns
 * Handles all filter logic, state, and operations
 */

import { ref, computed } from 'vue'

export interface FilterState {
  search: string
  brand: string
  minPrice: number | null
  maxPrice: number | null
  sortBy: string
}

export interface FilterOptions {
  brands: string[]
  sortOptions: { label: string; value: string }[]
}

export function useProductFilters<T extends { brand: string; price: number; name: string; description?: string }>(products: Ref<T[]>) {
  // Filter state - single source of truth
  const filters = ref<FilterState>({
    search: '',
    brand: '',
    minPrice: null,
    maxPrice: null,
    sortBy: ''
  })

  // Loading state
  const isLoading = ref(false)

  // Computed properties
  const hasActiveFilters = computed(() => {
    return !!(
      filters.value.search ||
      filters.value.brand ||
      filters.value.minPrice !== null ||
      filters.value.maxPrice !== null ||
      filters.value.sortBy
    )
  })

  const availableBrands = computed(() => {
    return Array.from(new Set(products.value.map(product => product.brand)))
  })

  const sortOptions = computed((): FilterOptions['sortOptions'] => [
    { label: 'Default', value: '' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A to Z', value: 'name-asc' },
    { label: 'Name: Z to A', value: 'name-desc' },
    { label: 'Brand: A to Z', value: 'brand-asc' }
  ])

  // Filter and sort logic
  const filteredProducts = computed(() => {
    let result = products.value.filter(product => {
      // Brand filter
      if (filters.value.brand && product.brand !== filters.value.brand) {
        return false
      }

      // Price range filter
      if (filters.value.minPrice !== null && product.price < filters.value.minPrice) {
        return false
      }
      if (filters.value.maxPrice !== null && product.price > filters.value.maxPrice) {
        return false
      }

      // Search filter
      if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase()
        const matchesSearch =
          product.name.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)

        if (!matchesSearch) {
          return false
        }
      }

      return true
    })

    // Apply sorting
    if (filters.value.sortBy) {
      result = [...result].sort((a, b) => {
        switch (filters.value.sortBy) {
          case 'price-asc':
            return a.price - b.price
          case 'price-desc':
            return b.price - a.price
          case 'name-asc':
            return a.name.localeCompare(b.name)
          case 'name-desc':
            return b.name.localeCompare(a.name)
          case 'brand-asc':
            return a.brand.localeCompare(b.brand)
          default:
            return 0
        }
      })
    }

    return result
  })

  // Active filters for display
  const activeFilters = computed(() => {
    const active = []

    if (filters.value.brand) {
      active.push({
        type: 'brand' as const,
        label: filters.value.brand,
        value: filters.value.brand
      })
    }

    if (filters.value.minPrice !== null) {
      active.push({
        type: 'minPrice' as const,
        label: `Min: $${filters.value.minPrice}`,
        value: filters.value.minPrice
      })
    }

    if (filters.value.maxPrice !== null) {
      active.push({
        type: 'maxPrice' as const,
        label: `Max: $${filters.value.maxPrice}`,
        value: filters.value.maxPrice
      })
    }

    if (filters.value.search) {
      active.push({
        type: 'search' as const,
        label: `"${filters.value.search}"`,
        value: filters.value.search
      })
    }

    return active
  })

  // Filter actions
  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    filters.value[key] = value
  }

  function clearFilter(key: keyof FilterState) {
    if (key === 'minPrice' || key === 'maxPrice') {
      filters.value[key] = null
    } else {
      filters.value[key] = ''
    }
  }

  function clearAllFilters() {
    filters.value = {
      search: '',
      brand: '',
      minPrice: null,
      maxPrice: null,
      sortBy: ''
    }
  }

  function removeActiveFilter(type: string) {
    switch (type) {
      case 'brand':
        filters.value.brand = ''
        break
      case 'minPrice':
        filters.value.minPrice = null
        break
      case 'maxPrice':
        filters.value.maxPrice = null
        break
      case 'search':
        filters.value.search = ''
        break
    }
  }

  return {
    // State
    filters: readonly(filters),
    isLoading,

    // Computed
    hasActiveFilters,
    filteredProducts,
    availableBrands,
    sortOptions,
    activeFilters,
    resultCount: computed(() => filteredProducts.value.length),

    // Actions
    updateFilter,
    clearFilter,
    clearAllFilters,
    removeActiveFilter,

    // Utilities
    setLoading: (loading: boolean) => { isLoading.value = loading }
  }
}