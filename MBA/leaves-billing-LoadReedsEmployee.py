# **********************************************************************************************************************************
# Auther       : Cgnizant Technology Solutions
# Description  : This script generates a unique job control id for each cycle
# How to Call  : 
# Pre-Requiste : 
# **********************************************************************************************************************************
#importing libraries
from awsglue.transforms import *
from awsglue.dynamicframe import DynamicFrame
from awsglue.utils import getResolvedOptions
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql import SparkSession
from pyspark.context import SparkContext, SparkConf
from pyspark.sql.types import StructType, StructField, StringType, TimestampType
from pyspark.sql.functions import col
from pyspark.sql import functions as F
from pyspark.sql.functions import lit
from datetime import datetime
import os
import sys
import uuid
import json
import alight_utilities
import redshift_connector

#######################################################  
#bringing in environment specific connection variables.
args = getResolvedOptions(sys.argv, ['JOB_NAME','targetpath','env'])

env =args['env']
if env =='dev':
    sns_env ='d1'
elif env == 'qa':
    sns_env ='q1'
elif env == 'qc':
    sns_env ='u1'
elif env == 'prod':
    sns_env ='p1'

# REDSHIFT DETAILS
with open('rs_config.json') as config_file:
    config = json.load(config_file)
    rs_bucket = config.get(env, {}).get('config_bucket', '{}')
    rs_url =  config.get(env, {}).get('host', '{}')
    rs_port =  config.get(env, {}).get('port', '{}')
    rs_secret_name =  config.get(env, {}).get('secret_name', '{}')
    rs_database =  config.get(env, {}).get('database', '{}')

credentials = alight_utilities.get_credentials(rs_secret_name)
username =credentials['username']
password= credentials['password']

#######################################################  
#Starting Main Part of the Pipeline.
def main():
    
    if sys.argv[0] is  None:
        print("No script to execute")
        sys.exit(1)
        
    else:
        
        print("Starting execution of "+script_nm)
        spark_load()
        
		
def log(type, msg):
    print("{}:{}: {}".format(str(datetime.now()), type.upper(), msg))
    
def spark_load():
    appName = "J_reeds_billing_LoadReedsEmployee"
    table_nm="reed_employee"
    s3_path = args['targetpath']
    db_name = "billing_report"
    op_mode="overwrite"
    op_format="parquet"
    partition = "rundate"
    table_path=s3_path+db_name+"/"+table_nm+"/"
    log("INFO","Starting execution to load table:"+db_name+"."+table_nm)
    conf = SparkConf()
    sc = SparkContext()
    glueContext = GlueContext(sc)
    spark = glueContext.spark_session
    job = Job(glueContext)

    
    #######################################################  
    #importing tables directly from s3 bucket for main script.
    
    #bring in the unique jobcontrolid and rundate.
    bdm_hist_job_control = glueContext.create_dynamic_frame.from_catalog(
    table_name="bdm_hist_job_control",database="leaves_rpt_s3")
    bdm_hist_job_control = bdm_hist_job_control.toDF()
    bdm_hist_job_control.createOrReplaceTempView("bdm_hist_job_control_temp")
    df=spark.sql("select * from bdm_hist_job_control_temp where createdts = (select max(createdts) from bdm_hist_job_control_temp)")
    df.createOrReplaceTempView("bdm_hist_job_control")
    
    #current rundate saving to variable.
    current_rundate = spark.sql("select max(created_dt) from bdm_hist_job_control_temp").collect()
    current_rundate = current_rundate[0][0]
        
    ####################################################### 
    #ETL Code
    #creating main table.                            
    sql_qry_0="SELECT \
				tblemployee.source_db,\
									   tblemployee.employerid,\
									   tblemployer.clientname,\
									   tblemployee.employeeid,\
									   tblemployee.employeenumber,\
									   tblemploymentstatus.employmentstatus,\
									   case when tblemploymentstatus.isactive = 1 then 'true' else 'false' end as isactive,\
									   tblemployee.originalhiredate,\
									   tblemployee.rehiredate,\
									   tblemployee.servicedate,\
									   case when tblemployee.keyemployee = 1 then 'true' else 'false' end as keyemployee,\
									   DATEDIFF(day,COALESCE(tblemployee.rehiredate,tblemployee.originalhiredate,tblemployee.servicedate),'{}') continuousservice,\
									   DATEDIFF(day,COALESCE(servicedate,originalhiredate,rehiredate),'{}') noncontinuousservice,\
									   tblemployeeclass.classname,\
									   tbljob.jobtitle,\
									   tbljob.jobcode,\
									   tblstate.statecode WorkStateCode,\
									   tblstate.statename WorkStateName,\
									   tblcountry.countrycode2 WorkCountryCode,\
									   tblcountry.countryname WorkCountryName,\
									   tbljob.hoursperweek,\
									   CASE\
										 WHEN tbljob.flsaexempt = 1 THEN 'Y'\
										 ELSE 'N'\
									   END AS exemptstatus,\
									   tblpaytype.paytype,\
									   CASE\
										 WHEN tbljob.parttime = 1 THEN 'Y'\
										 ELSE 'N'\
									   END AS parttimestatus,\
									   tblperson.firstname,\
									   tblperson.lastname,\
									   tblpersonmaritalstatus.maritalstatus,\
									   tblpersongender.gender,\
									   tblperson.birthdate,\
									   CAST(DATEDIFF(day,tblperson.birthdate,'{}') / 365.25 AS DECIMAL(10,2)) age,\
									   tblperson.deceaseddate,\
									   CAST(DATEDIFF(day,birthdate,deceaseddate) / 365.25 AS DECIMAL(10,2)) AS deceasedage,\
									   CASE\
										 WHEN UPPER(tblpersonaddress.addresstype) = 'MAILING' THEN tbladdress.address1\
										 ELSE NULL\
									   END mailaddress1,\
									   CASE\
										 WHEN UPPER(tblpersonaddress.addresstype) = 'MAILING' THEN tbladdress.address2\
										 ELSE NULL\
									   END mailaddress2,\
									   CASE\
										 WHEN UPPER(tblpersonaddress.addresstype) = 'MAILING' THEN tbladdress.city\
										 ELSE NULL\
									   END mailcity,\
									   CASE\
										 WHEN UPPER(tblpersonaddress.addresstype) = 'MAILING' THEN tblstate_home.statecode\
										 ELSE NULL\
									   END mailstatecode,\
									   CASE\
										 WHEN UPPER(tblpersonaddress.addresstype) = 'MAILING' THEN tblstate_home.statename\
										 ELSE NULL\
									   END mailstatename,\
									   CASE\
										 WHEN UPPER(tblpersonaddress.addresstype) = 'MAILING' THEN tbladdress.postalcode\
										 ELSE NULL\
									   END mailpostalcode,\
									   CASE\
										 WHEN UPPER(tblpersonaddress.addresstype) = 'MAILING' THEN tblcountry_home.countryname\
										 ELSE NULL\
									   END mailcountryname,\
									   CASE\
										 WHEN UPPER(tblpersonaddress.addresstype) = 'MAILING' THEN tblcountry_home.countrycode2\
										 ELSE NULL\
									   END mailcountrycode,\
									   tblemail.emailaddress personalemail,\
									   tblemailWork.emailaddress workemail,\
									   empben.benefitablebaseamount baseamount,\
									   periodtype.name baseperiod,\
                                                                           tblemployeeclass.classcode\
				FROM leaves_raw_s3.client010_dbo_tblemployee tblemployee\
				INNER JOIN leaves_raw_s3.client010_dbo_tblemploymentstatus tblemploymentstatus\
						  ON tblemployee.ineffectivedate IS NULL\
						 AND tblemploymentstatus.ineffectivedate IS NULL\
						 AND tblemploymentstatus.employmentstatusid = tblemployee.employmentstatusid\
						 AND tblemploymentstatus.source_db = tblemployee.source_db\
						 AND tblemploymentstatus.isactive = 1 \
				INNER JOIN leaves_raw_s3.client010_dbo_tblemployer tblemployer\
						ON tblemployer.employerid = tblemployee.employerid\
						 AND tblemployer.source_db = tblemployee.source_db\
				inner join(select distinct tblclient.clientname clientname,tblclient.clientid hubclientid,cfgclient.clientid toolclientid \
				from leaves_raw_s3.hub010_dbo_tblclient tblclient \
				inner join leaves_raw_s3.toolsreedservices_dbo_cfgclient cfgclient\
				on cfgclient.clientcode=tblclient.clientcode\
				where COALESCE(cast(tblclient.deimplementationdate as date), '2079-01-01') >= add_months('{}', -1)) ac\
				ON\
				ac.hubclientid=tblemployee.employerid\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tbljob tbljob\
							 ON tbljob.employerid = tblemployee.employerid\
							AND tbljob.source_db = tblemployee.source_db\
							AND tbljob.employeeid = tblemployee.employeeid\
							AND tbljob.ineffectivedate IS NULL\
							AND tbljob.thrudate IS NULL\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblstate tblstate\
							 ON tbljob.stateid = tblstate.stateid\
							AND tblstate.source_db = tblemployee.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblcountry tblcountry\
							 ON tblstate.countryid = tblcountry.countryid\
							AND tblcountry.source_db = tblemployee.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblperson tblperson\
							 ON tblperson.personid = tblemployee.personid\
							AND tblperson.employerid = tblemployee.employerid\
							AND tblperson.source_db = tblemployee.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblpaytype tblpaytype ON tblpaytype.paytypeid = tbljob.paytypeid and tbljob.source_db = tblpaytype.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblemployeeclass tblemployeeclass ON tblemployeeclass.employeeclassid = tbljob.employeeclassid and tbljob.source_db = tblemployeeclass.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblpersonmaritalstatus tblpersonmaritalstatus ON tblpersonmaritalstatus.maritalstatusid = tblperson.maritalstatusid and tblpersonmaritalstatus.source_db = tblperson.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblpersongender tblpersongender\
							 ON tblpersongender.source_db = tblemployee.source_db\
							AND tblpersongender.genderid = tblperson.genderid\
				LEFT OUTER JOIN (select tblpersonaddress.*,tblpersonaddresstype.addresstype\
				from leaves_raw_s3.client010_dbo_tblpersonaddress tblpersonaddress \
				INNER JOIN \
				leaves_raw_s3.client010_dbo_tblpersonaddresstype tblpersonaddresstype\
				 ON tblpersonaddress.ineffectivedate IS NULL and tblpersonaddress.source_db=tblpersonaddresstype.source_db\
				AND ('{}' BETWEEN tblpersonaddress.startdate AND enddate\
				 OR tblpersonaddress.enddate IS NULL) \
				AND tblpersonaddresstype.personaddresstypeid = tblpersonaddress.personaddresstypeid\
				AND UPPER (tblpersonaddresstype.addresstype) = 'MAILING') tblpersonaddress\
				ON\
				tblpersonaddress.personid = tblperson.personid and tblpersonaddress.source_db = tblperson.source_db\
				and tblpersonaddress.employerid = tblperson.employerid\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tbladdress tbladdress \
				ON tbladdress.addressid = tblpersonaddress.addressid and tbladdress.source_db = tblpersonaddress.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblstate tblstate_home\
				ON tbladdress.stateid = tblstate_home.stateid\
				AND tblstate_home.source_db = tblemployee.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblcountry tblcountry_home\
				ON tbladdress.countryid = tblcountry_home.countryid\
				AND tblcountry_home.source_db = tblemployee.source_db\
				LEFT OUTER JOIN (select a.*\
								 ,row_number() over(partition by a.employerid,a.personid,a.source_db order by a.changeddate desc) sl \
							 from leaves_raw_s3.client010_dbo_tblpersonemail a\
							 where a.personemailaccounttypeid = 4 /*Home Email*/\
								   and a.ineffectivedate IS NULL) tblpersonemail\
				ON tblpersonemail.sl=1\
				AND tblemployee.employerid = tblpersonemail.employerid\
				AND tblperson.personid = tblpersonemail.personid\
				AND tblperson.source_db = tblpersonemail.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblemail tblemail \
				ON \
				tblpersonemail.emailid = tblemail.emailid /*Home Email*/  AND tblpersonemail.source_db = tblemail.source_db\
				LEFT OUTER JOIN (select a.*\
								 ,row_number() over(partition by a.employerid,a.personid,a.source_db order by a.changeddate desc) sl \
							 from leaves_raw_s3.client010_dbo_tblpersonemail a\
							 where a.personemailaccounttypeid = 3 /*Work Email*/\
								   and a.ineffectivedate IS NULL) tblpersonemailWork\
				ON tblpersonemailWork.sl = 1 /*Work Email*/\
				AND tblemployee.employerid = tblpersonemailWork.employerid\
				AND tblperson.personid = tblpersonemailWork.personid\
				AND tblperson.source_db = tblpersonemailWork.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_dbo_tblemail tblemailWork \
				ON tblpersonemailWork.emailid = tblemailWork.emailid /*Work Email*/ \
				AND tblpersonemailWork.source_db = tblemailWork.source_db\
				LEFT OUTER JOIN (SELECT *\
					FROM (SELECT employerid,\
				employeeid,\
				periodtypeid,\
				startdate,\
				benefitablebaseamount,\
				source_db,\
				ROW_NUMBER() OVER (PARTITION BY employerid,employeeid ORDER BY startdate DESC) sl_no\
					FROM leaves_raw_s3.client010_bc_employeebenefitablebase empben\
					WHERE empben.ineffectivedate IS NULL) A\
					WHERE sl_no = 1) empben\
				ON empben.employerid = tblemployee.employerid\
				AND empben.employeeid = tblemployee.employeeid\
				AND empben.source_db = tblemployee.source_db\
				LEFT OUTER JOIN leaves_raw_s3.client010_bc_periodtype periodtype \
				ON empben.periodtypeid = periodtype.periodtypeid \
				AND empben.source_db = periodtype.source_db".format(current_rundate,current_rundate,current_rundate,current_rundate,current_rundate)
				
	#saving sql statement to spark df.
    df_0=spark.read \
        .format("jdbc") \
        .option("url", f"jdbc:redshift://{rs_url}:{rs_port}/{rs_database}") \
        .option("query", sql_qry_0) \
        .option("user", username) \
        .option("password", password) \
        .option("driver", "com.amazon.redshift.jdbc42.Driver") \
        .option("encoding", "utf-8")\
        .load()
    
    #saving spark df to sql temp table.
    df_0.createOrReplaceTempView("emp")
    
    
    #creating final sql and spark df.
    try:
        sql_qry_1="select distinct source_db,employerid,clientname,	employeeid,	employeenumber,	employmentstatus,cast(isactive as boolean),\
        CAST(originalhiredate as date),cast(rehiredate as date),cast(servicedate as date),cast(keyemployee as boolean),cast(continuousservice as int),cast(noncontinuousservice as int),classname,jobtitle,jobcode,WorkStateCode,WorkStateName,WorkCountryCode,WorkCountryName,\
        cast(hoursperweek as float),exemptstatus,paytype,parttimestatus,firstname,lastname,maritalstatus,gender,\
        cast(birthdate as date),cast(age as float),cast(deceaseddate as date),cast(deceasedage as float),mailaddress1,mailaddress2,\
        mailcity,mailstatecode,mailstatename,mailpostalcode,mailcountryname,mailcountrycode,personalemail,workemail,\
        cast(baseamount as int),baseperiod,jobcontrolid,bdm_hist_job_control.created_dt as created_dt,\
        current_timestamp as CreatedTS,'"+appName+"' as CreatedBy,\
        emp.classcode from emp cross join bdm_hist_job_control"
        df=spark.sql(sql_qry_1)
        
    except Exception as e:
        log("ERROR","During preperation of source data")
        log("ERROR",e)
        sys.exit(1)
     
    #writing spark df to s3 bucket.   
    try:
        df.write.save(format=op_format,mode=op_mode,path=table_path)
        log("INFO","Finished execution to load table:"+db_name+"."+table_nm)
    except:
        log("ERROR","While loading the table:"+db_name+"."+table_nm)
        log("ERROR",e)
        sys.exit(1)     

        
#Executing above funtions.       
if __name__ == '__main__':
    script_nm=sys.argv[0]
    main()