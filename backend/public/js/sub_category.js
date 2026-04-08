function loadSubCategories() {
  if ($.fn.DataTable.isDataTable('#subCategoryTable')) {
    $('#subCategoryTable').DataTable().destroy();
  }

  $.get('/category/sub/all', function(res) {
    if (!res.success) return;

    var html = '';
    res.data.forEach(function(row, i) {
      var status = row.status == 1
        ? '<span class="bg-success-focus text-success-main px-24 py-4 rounded-pill fw-medium text-sm">Active</span>'
        : '<span class="bg-danger-focus text-danger-main px-24 py-4 rounded-pill fw-medium text-sm">Inactive</span>';

      html += '<tr>'
        + '<td>' + (i + 1) + '</td>'
        + '<td>' + row.category_name + '</td>'
        + '<td>' + row.name + '</td>'
        + '<td>' + row.slug + '</td>'
        + '<td>' + status + '</td>'
        + '<td>' + new Date(row.created_at).toLocaleDateString() + '</td>'
        + '<td>'
        + '<button class="w-32-px h-32-px bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center edit-btn"'
        + ' data-id="' + row.id + '" data-name="' + row.name + '" data-category-id="' + row.category_id + '" data-status="' + row.status + '">'
        + '<iconify-icon icon="lucide:edit"></iconify-icon></button> '
        + '<button class="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center delete-btn"'
        + ' data-id="' + row.id + '" data-name="' + row.name + '">'
        + '<iconify-icon icon="mingcute:delete-2-line"></iconify-icon></button>'
        + '</td></tr>';
    });

    $('#subCategoryTableBody').html(
      html || '<tr><td colspan="7" class="text-center">No sub categories found</td></tr>'
    );

    $('#subCategoryTable').DataTable({
      pageLength: 10,
      order: [],
      columnDefs: [
        { orderable: false, targets: [4, 6] }
      ]
    });
  });
}

$(document).ready(function () {
  if ($('#subCategoryTableBody').length === 0) return;

  loadSubCategories();

  // ── ADD ──────────────────────────────────────────────
  $('#saveBtn').on('click', function () {
    var category_id = $('#add_category_id').val();
    var name = $('#add_name').val().trim();
    if (!category_id) return showToast('Please select a category', 'danger');
    if (!name) return showToast('Name is required', 'danger');

    $.post('/category/sub/create', {
      category_id: category_id, name: name, status: $('#add_status').val()
    }, function(res) {
      if (res.success) {
        $('#addModal').modal('hide');
        $('#add_name').val('');
        $('#add_category_id').val('');
        $('#add_status').val('1');
        loadSubCategories();
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'danger');
      }
    }).fail(function(xhr) { showToast('Server error: ' + xhr.status, 'danger'); });
  });

  // ── EDIT ─────────────────────────────────────────────
  $(document).on('click', '.edit-btn', function () {
    $('#edit_id').val($(this).data('id'));
    $('#edit_name').val($(this).data('name'));
    $('#edit_category_id').val($(this).data('categoryId'));
    $('#edit_status').val($(this).data('status'));
    $('#editModal').modal('show');
  });

  $('#updateBtn').on('click', function () {
    var name = $('#edit_name').val().trim();
    var category_id = $('#edit_category_id').val();
    if (!category_id) return showToast('Please select a category', 'danger');
    if (!name) return showToast('Name is required', 'danger');

    $.post('/category/sub/update', {
      id: $('#edit_id').val(), category_id: category_id, name: name, status: $('#edit_status').val()
    }, function(res) {
      if (res.success) {
        $('#editModal').modal('hide');
        loadSubCategories();
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
      url: '/category/sub/delete/' + $('#delete_id').val(),
      type: 'DELETE',
      success: function(res) {
        if (res.success) {
          $('#deleteModal').modal('hide');
          loadSubCategories();
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