from openerp import models, fields, api, _
from openerp.osv import osv
from openerp.exceptions import except_orm, ValidationError
from StringIO import StringIO
import urllib2, httplib, urlparse, gzip, requests, json
import openerp.addons.decimal_precision as dp
import logging
import datetime
from openerp.fields import Date as newdate

#Get the logger
_logger = logging.getLogger(__name__)

class project_project(models.Model):
        _inherit = 'project.project'

        @api.multi
        def _get_all_children(self, project_name = ''):
		import pdb;pdb.set_trace()
		print "PROJ" + self.name
		print project_name
                if not self.ensure_one():
                        return None
                if self.child_ids:
                        for project in self.child_ids:
                                project._get_all_children(self.name)
		else:
			print "PRJ" + project_name
	                return project_name


	@api.one
	def _compute_all_children(self):
		import pdb;pdb.set_trace()
		self.all_children = self._get_all_children(self.name)

        all_children = fields.Char(string='all_children',compute=_compute_all_children)


