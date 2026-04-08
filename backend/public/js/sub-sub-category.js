// ✅ Suppress DataTables warnings
$.fn.dataTable.ext.errMode = 'none';

function loadSubSubCategories() {
  if ($.fn.DataTable.isDataTable('#subSubTable')) {
    $('#subSubTable').DataTable().destroy();
  }

  $.get('/category/sub-sub/all', function(res) {
    if (!res.success) return;

    var html = '';
    res.data.forEach(function(row, i) {
      var status = row.status == 1
        ? '<span class="bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm">Active</span>'
        : '<span class="bg-danger-focus text-danger-main px-24 py-4 rounded-pill fw-medium text-sm">Inactive</span>';

      html += '<tr>'
        + '<td>' + (i + 1) + '</td>'
        + '<td>' + row.category_name + '</td>'
        + '<td>' + row.sub_category_name + '</td>'
        + '<td>' + row.name + '</td>'
        + '<td>' + row.slug + '</td>'
        + '<td>' + status + '</td>'
        + '<td>'
        + '<button class="w-32-px h-32-px bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center edit-btn"'
        + ' data-id="' + row.id + '" data-name="' + row.name + '" data-category-id="' + row.category_id + '" data-sub-category-id="' + row.sub_category_id + '" data-status="' + row.status + '">'
        + '<iconify-icon icon="lucide:edit"></iconify-icon></button> '
        + '<button class="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center delete-btn"'
        + ' data-id="' + row.id + '" data-name="' + row.name + '">'
        + '<iconify-icon icon="mingcute:delete-2-line"></iconify-icon></button>'
        + '</td></tr>';
    });

    $('#subSubTableBody').html(
      html || '<tr><td colspan="7" class="text-center">No records found</td></tr>'
    );

    $('#subSubTable').DataTable({
      pageLength: 10,
      order: [],
      columnDefs: [
        { orderable: false, targets: [5, 6] }
      ]
    });
  });
}

function loadSubByCategory(categoryId, targetSelect, loadingEl, selectedId) {
  $(targetSelect).prop('disabled', true).html('<option value="">Loading...</option>');
  $(loadingEl).removeClass('d-none');

  $.get('/category/sub-by-category/' + categoryId, function(res) {
    $(loadingEl).addClass('d-none');
    if (res.success && res.data.length > 0) {
      var opts = '<option value="">-- Select Sub Category --</option>';
      res.data.forEach(function(sc) {
        var sel = (selectedId && sc.id == selectedId) ? 'selected' : '';
        opts += '<option value="' + sc.id + '" ' + sel + '>' + sc.name + '</option>';
      });
      $(targetSelect).html(opts).prop('disabled', false);
    } else {
      $(targetSelect).html('<option value="">No sub categories found</option>');
    }
  });
}

$(document).ready(function () {
  if ($('#subSubTableBody').length === 0) return;

  loadSubSubCategories();

  // ── CATEGORY CHANGE (ADD) ─────────────────────────────
  $('#add_category_id').on('change', function() {
    var id = $(this).val();
    if (!id) {
      $('#add_sub_category_id').prop('disabled', true).html('<option value="">-- Select Category First --</option>');
      return;
    }
    loadSubByCategory(id, '#add_sub_category_id', '#add_sub_loading', null);
  });

  // ── CATEGORY CHANGE (EDIT) ────────────────────────────
  $('#edit_category_id').on('change', function() {
    var id = $(this).val();
    if (!id) {
      $('#edit_sub_category_id').prop('disabled', true).html('<option value="">-- Select Category First --</option>');
      return;
    }
    loadSubByCategory(id, '#edit_sub_category_id', '#edit_sub_loading', null);
  });

  // ── ADD ──────────────────────────────────────────────
  $('#saveBtn').on('click', function () {
    var category_id = $('#add_category_id').val();
    var sub_category_id = $('#add_sub_category_id').val();
    var name = $('#add_name').val().trim();
    if (!category_id) return showToast('Please select a category', 'danger');
    if (!sub_category_id) return showToast('Please select a sub category', 'danger');
    if (!name) return showToast('Name is required', 'danger');

    $.post('/category/sub-sub/create', {
      sub_category_id: sub_category_id, name: name, status: $('#add_status').val()
    }, function(res) {
      if (res.success) {
        $('#addModal').modal('hide');
        $('#add_name').val('');
        $('#add_category_id').val('');
        $('#add_status').val('1');
        $('#add_sub_category_id').prop('disabled', true).html('<option value="">-- Select Category First --</option>');
        loadSubSubCategories();
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'danger');
      }
    }).fail(function(xhr) { showToast('Server error: ' + xhr.status, 'danger'); });
  });

  // ── EDIT ─────────────────────────────────────────────
  $(document).on('click', '.edit-btn', function () {
    var categoryId = $(this).data('categoryId');
    var subCategoryId = $(this).data('subCategoryId');
    $('#edit_id').val($(this).data('id'));
    $('#edit_name').val($(this).data('name'));
    $('#edit_status').val($(this).data('status'));
    $('#edit_category_id').val(categoryId);
    loadSubByCategory(categoryId, '#edit_sub_category_id', '#edit_sub_loading', subCategoryId);
    $('#editModal').modal('show');
  });

  // ── UPDATE ────────────────────────────────────────────
  $('#updateBtn').on('click', function () {
    var sub_category_id = $('#edit_sub_category_id').val();
    var name = $('#edit_name').val().trim();
    if (!$('#edit_category_id').val()) return showToast('Please select a category', 'danger');
    if (!sub_category_id) return showToast('Please select a sub category', 'danger');
    if (!name) return showToast('Name is required', 'danger');

    $.post('/category/sub-sub/update', {
      id: $('#edit_id').val(), sub_category_id: sub_category_id, name: name, status: $('#edit_status').val()
    }, function(res) {
      if (res.success) {
        $('#editModal').modal('hide');
        loadSubSubCategories();
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'danger');
      }
    }).fail(function(xhr) { showToast('Server error: ' + xhr.status, 'danger'); });
  });

  // ── DELETE ───────────────────────────────────────────
  $(document).on('click', '.delete-btn', function () {
    $('#delete_id').val($(this).data('id'));
    $('#delete_name').text($(this).data('name'));
    $('#deleteModal').modal('show');
  });

  $('#confirmDeleteBtn').on('click', function () {
    $.ajax({
      url: '/category/sub-sub/delete/' + $('#delete_id').val(),
      type: 'DELETE',
      success: function(res) {
        if (res.success) {
          $('#deleteModal').modal('hide');
          loadSubSubCategories();
          showToast(res.message, 'success');
        } else {
          showToast(res.message, 'danger');
        }
      },
      error: function(xhr) { showToast('Server error: ' + xhr.status, 'danger'); }
    });
  });
});

// ── TOAST ─────────────────────────────────────────────
function showToast(message, type) {
  var id = 'toast_' + Date.now();
  $('body').append(
    '<div class="position-fixed top-0 end-0 p-3" style="z-index:9999" id="' + id + '">'
    + '<div class="toast show align-items-center text-bg-' + type + ' border-0">'
    + '<div class="d-flex"><div class="toast-body">' + message + '</div>'
    + '<button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="$(\'#' + id + '\').remove()"></button>'
    + '</div></div></div>'
  );
  setTimeout(function () { $('#' + id).remove(); }, 3000);
}