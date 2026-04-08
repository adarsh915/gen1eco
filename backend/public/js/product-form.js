$(document).ready(function () {
    // Data injected by EJS into window variables
    const categories = window._formCategories || [];
    const product = window._formProduct || null;

    const $mappingContainer = $('#category-mapping-container');
    const $addMappingBtn = $('#add-category-mapping');

    const initialMappings = (
        product &&
        Array.isArray(product.category_mappings) &&
        product.category_mappings.length > 0
    )
        ? product.category_mappings
        : [{
            category_id: product ? product.category_id : '',
            sub_category_id: product ? product.sub_category_id : '',
            sub_sub_category_id: product ? product.sub_sub_category_id : ''
        }];

    function buildCategoryOptions(selectedCategoryId) {
        let html = '<option value="">-- Select Category --</option>';
        categories.forEach(function(category) {
            const selected = String(selectedCategoryId || '') === String(category.id) ? ' selected' : '';
            html += '<option value="' + category.id + '"' + selected + '>' + category.name + '</option>';
        });
        return html;
    }

    function buildEmptySubCategoryOptions() {
        return '<option value="">-- Select Sub Category --</option>';
    }

    function buildEmptySubSubCategoryOptions() {
        return '<option value="">-- Select Sub Sub Category --</option>';
    }

    function rowTemplate(mapping, index) {
        const cardLabel = index === 0 ? 'Primary Category' : 'Additional Category ' + index;
        return (
            '<div class="border rounded p-3 category-map-row" data-index="' + index + '">' +
                '<div class="d-flex justify-content-between align-items-center mb-2">' +
                    '<span class="fw-semibold">' + cardLabel + '</span>' +
                    '<button type="button" class="btn btn-outline-danger btn-sm remove-category-mapping">' +
                        '<i class="ri-delete-bin-line"></i>' +
                    '</button>' +
                '</div>' +
                '<div class="row g-2">' +
                    '<div class="col-md-4">' +
                        '<label class="form-label">Category <span class="text-danger">*</span></label>' +
                        '<select name="category_id[]" class="form-select category-select" required>' +
                            buildCategoryOptions(mapping.category_id) +
                        '</select>' +
                    '</div>' +
                    '<div class="col-md-4">' +
                        '<label class="form-label">Sub Category</label>' +
                        '<select name="sub_category_id[]" class="form-select sub-category-select">' +
                            buildEmptySubCategoryOptions() +
                        '</select>' +
                    '</div>' +
                    '<div class="col-md-4">' +
                        '<label class="form-label">Sub Sub Category</label>' +
                        '<select name="sub_sub_category_id[]" class="form-select sub-sub-category-select">' +
                            buildEmptySubSubCategoryOptions() +
                        '</select>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function loadSubCategories($row, selectedSubCategoryId, onComplete) {
        const $categorySelect = $row.find('.category-select');
        const $subCategorySelect = $row.find('.sub-category-select');
        const $subSubCategorySelect = $row.find('.sub-sub-category-select');
        const categoryId = $categorySelect.val();

        $subCategorySelect.html('<option value="">-- Loading... --</option>');
        $subSubCategorySelect.html(buildEmptySubSubCategoryOptions());

        if (!categoryId) {
            $subCategorySelect.html(buildEmptySubCategoryOptions());
            if (onComplete) onComplete();
            return;
        }

        $.get('/category/sub-by-category/' + categoryId, function(res) {
            let html = buildEmptySubCategoryOptions();
            if (res.success) {
                res.data.forEach(function(subCategory) {
                    const selected = String(selectedSubCategoryId || '') === String(subCategory.id) ? ' selected' : '';
                    html += '<option value="' + subCategory.id + '"' + selected + '>' + subCategory.name + '</option>';
                });
            }

            $subCategorySelect.html(html);
            if (onComplete) onComplete();
        }).fail(function() {
            $subCategorySelect.html(buildEmptySubCategoryOptions());
            if (onComplete) onComplete();
        });
    }

    function loadSubSubCategories($row, selectedSubSubCategoryId) {
        const $subCategorySelect = $row.find('.sub-category-select');
        const $subSubCategorySelect = $row.find('.sub-sub-category-select');
        const subCategoryId = $subCategorySelect.val();

        $subSubCategorySelect.html('<option value="">-- Loading... --</option>');

        if (!subCategoryId) {
            $subSubCategorySelect.html(buildEmptySubSubCategoryOptions());
            return;
        }

        $.get('/category/sub-sub-by-subcategory/' + subCategoryId, function(res) {
            let html = buildEmptySubSubCategoryOptions();
            if (res.success) {
                res.data.forEach(function(subSubCategory) {
                    const selected = String(selectedSubSubCategoryId || '') === String(subSubCategory.id) ? ' selected' : '';
                    html += '<option value="' + subSubCategory.id + '"' + selected + '>' + subSubCategory.name + '</option>';
                });
            }
            $subSubCategorySelect.html(html);
        }).fail(function() {
            $subSubCategorySelect.html(buildEmptySubSubCategoryOptions());
        });
    }

    function bindRowEvents($row) {
        $row.find('.category-select').on('change', function() {
            loadSubCategories($row, null, function() {
                loadSubSubCategories($row, null);
            });
        });

        $row.find('.sub-category-select').on('change', function() {
            loadSubSubCategories($row, null);
        });
    }

    function updateRowMeta() {
        $mappingContainer.find('.category-map-row').each(function(index) {
            const $row = $(this);
            $row.attr('data-index', index);
            const label = index === 0 ? 'Primary Category' : 'Additional Category ' + index;
            $row.find('.fw-semibold').text(label);
        });

        const rowCount = $mappingContainer.find('.category-map-row').length;
        $mappingContainer.find('.remove-category-mapping').prop('disabled', rowCount <= 1);
    }

    function appendRow(mapping) {
        const index = $mappingContainer.find('.category-map-row').length;
        $mappingContainer.append(rowTemplate(mapping, index));
        const $row = $mappingContainer.find('.category-map-row').last();

        bindRowEvents($row);
        loadSubCategories($row, mapping.sub_category_id, function() {
            loadSubSubCategories($row, mapping.sub_sub_category_id);
        });
        updateRowMeta();
    }

    initialMappings.forEach(function(mapping) {
        appendRow(mapping || {});
    });

    if ($mappingContainer.find('.category-map-row').length === 0) {
        appendRow({});
    }

    $addMappingBtn.on('click', function() {
        appendRow({
            category_id: '',
            sub_category_id: '',
            sub_sub_category_id: ''
        });
    });

    $mappingContainer.on('click', '.remove-category-mapping', function() {
        const $rows = $mappingContainer.find('.category-map-row');
        if ($rows.length <= 1) return;
        $(this).closest('.category-map-row').remove();
        updateRowMeta();
    });

    // Summernote editors
    $('#short_description').summernote({
        placeholder: 'Short Description...',
        height: 150,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['view', ['fullscreen', 'codeview']]
        ]
    });

    $('#description').summernote({
        placeholder: 'Full Description...',
        height: 300,
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link']],
            ['view', ['fullscreen', 'codeview']]
        ]
    });
});
