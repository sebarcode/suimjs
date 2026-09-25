/**
 * Return a new list with selected items first, following the model's selection
 * order. Non-selected items keep their existing order.
 */
export function selectedItemsFirst(items, selectedItems) {
    if (!Array.isArray(items) || !Array.isArray(selectedItems) || selectedItems.length === 0) {
        return Array.isArray(items) ? [...items] : [];
    }

    const selectedRanks = new Map();
    selectedItems.forEach((item, index) => {
        if (!selectedRanks.has(item?.key)) selectedRanks.set(item?.key, index);
    });

    return items
        .map((item, index) => ({ item, index }))
        .sort((left, right) => {
            const leftRank = selectedRanks.get(left.item?.key);
            const rightRank = selectedRanks.get(right.item?.key);
            const leftSelected = leftRank !== undefined;
            const rightSelected = rightRank !== undefined;

            if (leftSelected && rightSelected) return leftRank - rightRank;
            if (leftSelected) return -1;
            if (rightSelected) return 1;
            return left.index - right.index;
        })
        .map(({ item }) => item);
}
