from django.conf.urls import patterns, url

from web_pconsfold import views
urlpatterns = patterns('',
        url(r'^$', views.index, name='index'),
        url(r'(?P<pdb_id>[PF]{2}[0-9]{5}.[0-9]{1,2})/$', views.details, name='details'),
        )
